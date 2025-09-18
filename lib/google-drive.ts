import { google, drive_v3 } from "googleapis";
import type { MediaFeedResponse, MediaItem, EventCategory } from "@/types";

const MEDIA_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface ListMediaOptions {
  folderId: string;
  pageSize?: number;
  pageToken?: string;
  // The logical category name (e.g., 'community', 'youth', etc.) used to label eventType
  categoryName?: string;
}

// Infer the exact auth type accepted by google.drive options to avoid cross-package type conflicts
type DriveOptions = Parameters<typeof google.drive>[0];
type DriveAuth = DriveOptions extends { auth?: infer A } ? A : never;

class GoogleDriveService {
  private client: drive_v3.Drive | null = null;
  // Auth client used for Drive API requests
  private auth: unknown | null = null;
  private thumbnailCache = new Map<string, string>();
  private listCache = new Map<string, { data: MediaFeedResponse; expiresAt: number }>();
  private readonly LIST_CACHE_TTL_MS = 60 * 1000; // 60s
  private categoryFolderCache: { mapping: Record<string, string>; expiresAt: number } | null = null;
  private readonly CATEGORY_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  private createAuthClient(): unknown {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!email || !privateKey) {
      throw new Error("Google service account credentials are not configured");
    }

    return new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  }

  private async getAuthClient(): Promise<unknown> {
    if (this.auth) return this.auth;
    this.auth = this.createAuthClient();
    return this.auth;
  }

  async getAccessToken(): Promise<string> {
    const auth = await this.getAuthClient();
    // google-auth-library returns an object or string depending on version; normalize to string
    const tokenResp = await (auth as { getAccessToken: () => Promise<string | { token?: string | null }> }).getAccessToken();
    const token = typeof tokenResp === "string" ? tokenResp : tokenResp?.token;
    if (!token) throw new Error("Unable to acquire Google access token");
    return token;
  }

  private async getClient(): Promise<drive_v3.Drive> {
    if (this.client) return this.client;
    const auth = (await this.getAuthClient()) as unknown as DriveAuth;
    this.client = google.drive({ version: "v3", auth });
    return this.client;
  }

  async authenticate() {
    await this.getClient();
  }

  /**
   * Discover subfolders under a root folder and map them to known category names (case-insensitive).
   * Expected subfolder names: Education, Youth, Community, Charity, Spiritual
   */
  async getCategoryFolders(rootFolderId: string): Promise<Record<string, string>> {
    const now = Date.now();
    if (this.categoryFolderCache && this.categoryFolderCache.expiresAt > now) {
      return this.categoryFolderCache.mapping;
    }

    const drive = await this.getClient();
    const q = [
      `'${rootFolderId}' in parents`,
      "trashed = false",
      "mimeType = 'application/vnd.google-apps.folder'",
    ].join(" and ");

    const res = await drive.files.list({
      q,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const mapping: Record<string, string> = {};
    const targets = ["education", "youth", "community", "charity", "spiritual"];
    for (const f of res.data.files ?? []) {
      const name = (f.name || "").trim().toLowerCase();
      if (targets.includes(name) && f.id) {
        mapping[name] = f.id;
      }
    }

    this.categoryFolderCache = { mapping, expiresAt: now + this.CATEGORY_CACHE_TTL_MS };
    return mapping;
  }

  async listMediaFiles({ folderId, pageSize = 20, pageToken, categoryName }: ListMediaOptions): Promise<MediaFeedResponse> {
    try {
      // cache key based on list parameters
      const key = `${folderId}:${pageSize}:${pageToken ?? ""}:${categoryName ?? ""}`;
      const now = Date.now();
      const cached = this.listCache.get(key);
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }

      const drive = await this.getClient();

      // First, see if this folder contains event subfolders
      const folderQuery = [
        `'${folderId}' in parents`,
        "trashed = false",
        "mimeType = 'application/vnd.google-apps.folder'",
      ].join(" and ");

      const folderRes = await drive.files.list({
        q: folderQuery,
        fields: "files(id, name)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const eventFolders = folderRes.data.files ?? [];

      let items: MediaItem[] = [];

      if (eventFolders.length > 0) {
        // There are subfolders — they might be event folders or category folders containing event folders.
        for (const level1Folder of eventFolders) {
          if (!level1Folder.id) continue;

          // Check if this folder contains further subfolders (grandchildren)
          const childFolderQuery = [
            `'${level1Folder.id}' in parents`,
            "trashed = false",
            "mimeType = 'application/vnd.google-apps.folder'",
          ].join(" and ");

          const childFolderRes = await drive.files.list({
            q: childFolderQuery,
            fields: "files(id, name)",
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          });

          const grandchildren = childFolderRes.data.files ?? [];

          const collectFromFolder = async (folderIdToScan: string, eventName?: string) => {
            const mediaQuery = [
              `'${folderIdToScan}' in parents`,
              "trashed = false",
              `(mimeType contains 'video/' or mimeType contains 'image/')`,
            ].join(" and ");

            const mediaRes = await drive.files.list({
              q: mediaQuery,
              fields:
                "files(id, name, mimeType, createdTime, description, webViewLink, webContentLink, thumbnailLink, videoMediaMetadata(durationMillis), imageMediaMetadata(width, height))",
              orderBy: "createdTime desc",
              pageSize: Math.min(pageSize - items.length, pageSize),
              supportsAllDrives: true,
              includeItemsFromAllDrives: true,
            });

            const files = mediaRes.data.files ?? [];
            const mapped: MediaItem[] = files
              .filter((file) => file.mimeType && MEDIA_MIME_TYPES.some((mime) => file.mimeType?.startsWith(mime.split("/")[0])))
              .map((file) => {
                const isVideo = file.mimeType?.startsWith("video");
                const id = file.id ?? "";
                // Determine category from parent folder if categoryName isn't provided
                const folderCategory = (level1Folder.name || "").trim().toLowerCase();
                const allowed: EventCategory[] = ["education", "spiritual", "community", "charity", "youth", "volunteering"];
                const resolvedCategory: EventCategory | "general" = (categoryName as EventCategory) ?? (allowed.includes(folderCategory as EventCategory) ? (folderCategory as EventCategory) : "general");
                return {
                  id,
                  type: isVideo ? "video" : "image",
                  url: isVideo
                    ? `/api/media/stream-video/${id}`
                    : `/api/media/stream/${id}`,
                  thumbnail: isVideo
                    ? (file.thumbnailLink ?? file.webViewLink ?? "")
                    : `/api/media/stream/${id}`,
                  // Prefer the event folder name as the title, not the raw filename
                  title: eventName ?? (level1Folder.name ?? "Media"),
                  description: file.description ?? (eventName ? `Event: ${eventName}` : ""),
                  date: file.createdTime ?? new Date().toISOString(),
                  eventType: resolvedCategory,
                  likes: Math.floor(Math.random() * 1500) + 100,
                  views: Math.floor(Math.random() * 25000) + 500,
                  duration: file.videoMediaMetadata?.durationMillis ? Number(file.videoMediaMetadata.durationMillis) / 1000 : undefined,
                  tags: eventName ? [eventName] : (level1Folder.name ? [level1Folder.name] : undefined),
                };
              });

            items.push(...mapped);
          };

          if (grandchildren.length > 0) {
            // Dive one more level: treat grandchildren as event folders
            for (const level2Folder of grandchildren) {
              if (!level2Folder.id) continue;
              await collectFromFolder(level2Folder.id, level2Folder.name ?? undefined);
              if (items.length >= pageSize) break;
            }
          } else {
            // No grandchildren; collect media directly from this folder
            await collectFromFolder(level1Folder.id, level1Folder.name ?? undefined);
          }

          if (items.length >= pageSize) break;
        }

        // When traversing nested folders, omit pagination for now (single page response)
        const result: MediaFeedResponse = { items: items.slice(0, pageSize), nextPageToken: undefined };
        this.listCache.set(key, { data: result, expiresAt: now + this.LIST_CACHE_TTL_MS });
        return result;
      }

      // Fallback: no subfolders; list media directly in the folder (original behavior)
      const query = [
        `'${folderId}' in parents`,
        "trashed = false",
        `(mimeType contains 'video/' or mimeType contains 'image/')`,
      ].join(" and ");

      const response = await drive.files.list({
        q: query,
        fields:
          "nextPageToken, files(id, name, mimeType, createdTime, description, webViewLink, webContentLink, thumbnailLink, videoMediaMetadata(durationMillis), imageMediaMetadata(width, height))",
        orderBy: "createdTime desc",
        pageSize,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const files = response.data.files ?? [];
      items = files
        .filter((file) => file.mimeType && MEDIA_MIME_TYPES.some((mime) => file.mimeType?.startsWith(mime.split("/")[0])))
        .map((file) => {
          const isVideo = file.mimeType?.startsWith("video");
          const id = file.id ?? "";
          return {
            id,
            type: isVideo ? "video" : "image",
            url: isVideo
              ? `/api/media/stream-video/${id}`
              : `/api/media/stream/${id}`,
            thumbnail: isVideo
              ? (file.thumbnailLink ?? file.webViewLink ?? "")
              : `/api/media/stream/${id}`,
            // Avoid exposing raw filenames; fallback to category label or generic title
            title: (categoryName ? `${categoryName}` : "Media"),
            description: file.description ?? "",
            date: file.createdTime ?? new Date().toISOString(),
            eventType: (categoryName as EventCategory) ?? "general",
            likes: Math.floor(Math.random() * 1500) + 100,
            views: Math.floor(Math.random() * 25000) + 500,
            duration: file.videoMediaMetadata?.durationMillis ? Number(file.videoMediaMetadata.durationMillis) / 1000 : undefined,
          } as MediaItem;
        });

      const result: MediaFeedResponse = {
        items,
        nextPageToken: response.data.nextPageToken ?? undefined,
      };

      // store in cache
      this.listCache.set(key, { data: result, expiresAt: now + this.LIST_CACHE_TTL_MS });
      return result;
    } catch (error) {
      console.error("Failed to list media files:", error);
      return { items: [], nextPageToken: undefined };
    }
  }

  async getFileMetadata(fileId: string) {
    try {
      const drive = await this.getClient();
      const response = await drive.files.get({
        fileId,
        fields:
          "id, name, mimeType, description, createdTime, webViewLink, webContentLink, thumbnailLink, videoMediaMetadata(durationMillis)",
        supportsAllDrives: true,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get file metadata:", error);
      return null;
    }
  }

  async generateStreamUrl(fileId: string) {
    try {
      await this.getAuthClient();
      return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
    } catch (error) {
      console.error("Failed to generate stream URL:", error);
      return "";
    }
  }

  async generateThumbnail(fileId: string) {
    if (this.thumbnailCache.has(fileId)) {
      return this.thumbnailCache.get(fileId) as string;
    }
    try {
      const metadata = await this.getFileMetadata(fileId);
      const thumbnail = metadata?.thumbnailLink ?? metadata?.webViewLink ?? "";
      this.thumbnailCache.set(fileId, thumbnail);
      return thumbnail;
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      return "";
    }
  }
}

export const googleDriveService = new GoogleDriveService();