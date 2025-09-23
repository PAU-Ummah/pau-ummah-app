import { google, drive_v3 } from "googleapis";
import type { MediaFeedResponse, MediaItem, EventCategory } from "@/types";

const MEDIA_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
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
  // Slightly longer TTL to avoid hammering Drive on scroll; API route still sets CDN cache
  private readonly LIST_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
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
      // Parse synthetic pagination token: "seed:pageIndex"
      let seed: number;
      let pageIndex = 0;
      if (pageToken && pageToken.includes(":")) {
        const [s, p] = pageToken.split(":");
        seed = Number(s);
        pageIndex = Number(p) || 0;
        if (!Number.isFinite(seed)) seed = Math.floor(Math.random() * 1_000_000_000);
      } else {
        seed = Math.floor(Math.random() * 1_000_000_000);
      }

      // Deterministic PRNG and shuffle based on seed (Mulberry32)
      const mulberry32 = (s: number) => () => {
        let t = (s += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const seededShuffle = <T,>(arr: T[], s: number): T[] => {
        const rand = mulberry32(s);
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

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
        // Build a list of source folders to sample from. If level1 folders contain grandchildren,
        // treat each grandchild as an event folder; otherwise, use the level1 folder itself.

        // Utility: shuffle array (Fisher-Yates)
        const shuffle = <T,>(arr: T[]): T[] => {
          const copy = [...arr];
          for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
          }
          return copy;
        };

        type Source = { id: string; eventName?: string; categoryFromFolder?: string; };
        let sources: Source[] = [];

        // Deterministically shuffle first-level folders to avoid repetition across pages
        const shuffledLevel1 = seededShuffle(eventFolders.filter((f) => !!f.id), seed + 11);

        for (const level1Folder of shuffledLevel1) {
          if (!level1Folder.id) continue;

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

          if (grandchildren.length > 0) {
            const shuffledGrandChildren = shuffle(grandchildren.filter((f) => !!f.id));
            for (const level2Folder of shuffledGrandChildren) {
              if (!level2Folder.id) continue;
              sources.push({ id: level2Folder.id, eventName: level2Folder.name ?? undefined, categoryFromFolder: level1Folder.name ?? undefined });
            }
          } else {
            sources.push({ id: level1Folder.id, eventName: level1Folder.name ?? undefined, categoryFromFolder: level1Folder.name ?? undefined });
          }
        }

        // Deterministically shuffle sources for stable randomness across pages
        sources = seededShuffle(sources, seed + 23);

        // To avoid too many API calls, cap the number of sources and items per source
        // Allow more sources to be sampled to reach the target page size
        const maxSources = Math.min(sources.length, Math.max(6, Math.ceil(pageSize / 2))); // e.g., up to ~10 for pageSize 20
        const perSource = Math.max(1, Math.ceil(pageSize / maxSources));
        

        const allowed: EventCategory[] = ["education", "spiritual", "community", "charity", "youth", "volunteering"];

        const collected: MediaItem[] = [];
        const seenIds = new Set<string>();
        for (let i = 0; i < maxSources && collected.length < pageSize; i++) {
          const src = sources[i];
          const mediaQuery = [
            `'${src.id}' in parents`,
            "trashed = false",
            `(mimeType contains 'video/' or mimeType contains 'image/')`,
          ].join(" and ");

          // Fetch a bit more than needed to allow within-folder randomization and paging slices
          const sliceOffset = pageIndex * perSource;
          const fetchCount = Math.min(50, Math.max(perSource * (pageIndex + 2), perSource * 2));

          const mediaRes = await drive.files.list({
            q: mediaQuery,
            fields:
              "files(id, name, mimeType, createdTime, description, webViewLink, webContentLink, thumbnailLink, videoMediaMetadata(durationMillis), imageMediaMetadata(width, height))",
            orderBy: "createdTime desc",
            pageSize: fetchCount,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          });

          const files = mediaRes.data.files ?? [];
          
          // For the first page, only slice if we have significantly more files than perSource
          // This allows small folders to show all their content
          const shouldSlice = pageIndex > 0 || files.length > perSource * 1.5;
          
          // Deterministically shuffle within this folder, varying by seed + source index + page
          const filesShuffled = seededShuffle(files, seed + i * 101 + pageIndex * 1009);
          const filesSliced = shouldSlice ? filesShuffled.slice(sliceOffset, sliceOffset + perSource) : filesShuffled;

          const mapped: MediaItem[] = filesSliced
            .filter((file) => !!file.id && file.mimeType && MEDIA_MIME_TYPES.some((mime) => file.mimeType?.startsWith(mime.split("/")[0])))
            .map((file) => {
              const isVideo = file.mimeType?.startsWith("video");
              const id = file.id ?? "";
              const folderCategory = (src.categoryFromFolder || "").trim().toLowerCase();
              const resolvedCategory: EventCategory | "general" = (categoryName as EventCategory) ?? (allowed.includes(folderCategory as EventCategory) ? (folderCategory as EventCategory) : "general");
              return {
                id,
                type: isVideo ? "video" : "image",
                url: isVideo ? `/api/media/stream-video/${id}` : `/api/media/stream/${id}`,
                thumbnail: isVideo ? (file.thumbnailLink ?? file.webViewLink ?? "") : `/api/media/stream/${id}`,
                title: src.eventName ?? "Media",
                description: file.description ?? (src.eventName ? `Event: ${src.eventName}` : ""),
                date: file.createdTime ?? new Date().toISOString(),
                eventType: resolvedCategory,
                likes: Math.floor(Math.random() * 1500) + 100,
                views: Math.floor(Math.random() * 25000) + 500,
                duration: file.videoMediaMetadata?.durationMillis ? Number(file.videoMediaMetadata.durationMillis) / 1000 : undefined,
                tags: src.eventName ? [src.eventName] : (src.categoryFromFolder ? [src.categoryFromFolder] : undefined),
              } as MediaItem;
            });

          for (const m of mapped) {
            if (!seenIds.has(m.id)) {
              seenIds.add(m.id);
              collected.push(m);
              if (collected.length >= pageSize) break;
            }
          }
          if (collected.length >= pageSize) break;
        }

        // Shuffle final items deterministically for this page
        const finalItems = seededShuffle(collected, seed + 777).slice(0, pageSize);
        const nextToken = finalItems.length >= pageSize ? `${seed}:${pageIndex + 1}` : undefined;
        const result: MediaFeedResponse = { items: finalItems, nextPageToken: nextToken };
        
        
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
        .filter((file) => !!file.id && file.mimeType && MEDIA_MIME_TYPES.some((mime) => file.mimeType?.startsWith(mime.split("/")[0])))
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