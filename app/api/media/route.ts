import { NextRequest, NextResponse } from "next/server";
import { googleDriveService } from "@/lib/google-drive";

// GET /api/media?limit=20&category=spiritual&pageToken=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const pageToken = searchParams.get("pageToken") ?? undefined;
    const category = (searchParams.get("category") ?? undefined)?.toLowerCase();

    // sanitize limit
    const pageSize = Math.min(Math.max(Number(limitParam ?? "20"), 1), 50);

    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json(
        { error: "Google Drive folder not configured" },
        { status: 500 }
      );
    }

    await googleDriveService.authenticate();
    // If a specific category is requested, try to map it to a subfolder under the root
    let effectiveFolderId = rootFolderId;
    if (category && category !== "all") {
      const mapping = await googleDriveService.getCategoryFolders(rootFolderId);
      const folderMatch = mapping[category];
      if (folderMatch) {
        effectiveFolderId = folderMatch;
      }
    }

    const result = await googleDriveService.listMediaFiles({
      folderId: effectiveFolderId,
      pageSize,
      pageToken,
      categoryName: category && category !== "all" ? category : undefined,
    });

    // Debug log to trace issues in production logs
    console.log(
      "[media] category=", category ?? "all",
      "folder=", effectiveFolderId,
      "pageSize=", pageSize,
      "pageToken=", pageToken ?? "-",
      "items=", result.items.length,
      "nextPageToken=", result.nextPageToken ?? "-",
    );

    return NextResponse.json(result, {
      headers: {
        // cache at the CDN for a short period, allow SWR
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Failed to list media:", error);
    return NextResponse.json(
      { error: "Unable to fetch media list" },
      { status: 500 }
    );
  }
}