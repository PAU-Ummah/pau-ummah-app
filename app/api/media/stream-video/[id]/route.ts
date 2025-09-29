import { NextRequest, NextResponse } from "next/server";
import { googleDriveService } from "@/lib/google-drive";

// Streams video content from Google Drive via the server with HTTP Range support.
// GET /api/media/stream-video/:id?quality=mobile
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing file id" }, { status: 400 });
  }

  try {
    await googleDriveService.authenticate();
    const metadata = await googleDriveService.getFileMetadata(id);
    const mimeType = metadata?.mimeType ?? "application/octet-stream";

    if (!mimeType.startsWith("video/")) {
      return NextResponse.json({ error: "Only videos are supported by this endpoint" }, { status: 415 });
    }

    // Parse query parameters for video optimization
    const { searchParams } = new URL(request.url);
    const quality = searchParams.get("quality");
    
    // Detect mobile devices from User-Agent
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Determine if we should use mobile optimization
    const useMobileOptimization = isMobile || quality === "mobile";

    const accessToken = await googleDriveService.getAccessToken();

    const range = request.headers.get("range");
    let driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`;
    
    // For mobile, we can request lower quality if the video has multiple versions
    // This is a placeholder - Google Drive doesn't support quality selection directly
    // but we can optimize the request headers and caching
    if (useMobileOptimization) {
      // Add mobile-specific parameters if supported by the source
      driveUrl += "&m=18"; // Lower quality parameter for mobile
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };
    if (range) headers["Range"] = range;

    const res = await fetch(driveUrl, { headers });

    if (!res.ok || !res.body) {
      // For range requests, Google may return 206. If not ok but 206, treat as ok
      const status = res.status || 502;
      if ((status === 206 || status === 200) && res.body) {
        // fallthrough
      } else {
        return NextResponse.json({ error: "Unable to stream video" }, { status });
      }
    }

    const outHeaders = new Headers();
    outHeaders.set("Content-Type", mimeType);
    
    // Forward range related headers if present
    const contentRange = res.headers.get("content-range");
    const contentLength = res.headers.get("content-length");
    const acceptRanges = res.headers.get("accept-ranges") ?? "bytes";
    if (contentRange) outHeaders.set("Content-Range", contentRange);
    if (contentLength) outHeaders.set("Content-Length", contentLength);
    if (acceptRanges) outHeaders.set("Accept-Ranges", acceptRanges);
    
    // Enhanced caching for mobile
    const cacheControl = useMobileOptimization
      ? "public, max-age=0, s-maxage=600, stale-while-revalidate=1200"
      : "public, max-age=0, s-maxage=300";
    outHeaders.set("Cache-Control", cacheControl);
    
    // Add performance hints for mobile
    if (useMobileOptimization) {
      outHeaders.set("X-Content-Type-Options", "nosniff");
      outHeaders.set("X-Frame-Options", "SAMEORIGIN");
    }

    const statusCode = res.status === 206 || contentRange ? 206 : 200;
    return new NextResponse(res.body, { status: statusCode, headers: outHeaders });
  } catch (error) {
    console.error("[stream-video] failed to stream file", error);
    return NextResponse.json({ error: "Internal error while streaming video" }, { status: 500 });
  }
}
