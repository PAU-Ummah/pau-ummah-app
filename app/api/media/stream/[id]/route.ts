import { NextRequest, NextResponse } from "next/server";
import { googleDriveService } from "@/lib/google-drive";

// Streams image content from Google Drive via the server, using the service account.
// GET /api/media/stream/:id?w=800&h=600&q=80&f=webp
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing file id" }, { status: 400 });
  }

  try {
    await googleDriveService.authenticate();

    // Get metadata to validate mime type and set headers
    const metadata = await googleDriveService.getFileMetadata(id);
    const mimeType = metadata?.mimeType ?? "application/octet-stream";

    if (!mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are supported by this endpoint" }, { status: 415 });
    }

    // Parse query parameters for image optimization
    const { searchParams } = new URL(request.url);
    const width = searchParams.get("w");
    const height = searchParams.get("h");
    
    // Detect mobile devices from User-Agent
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Set default mobile-optimized parameters
    const defaultWidth = isMobile ? 420 : 800;
    const defaultHeight = isMobile ? 600 : 600;

    const targetWidth = width ? parseInt(width, 10) : defaultWidth;
    const targetHeight = height ? parseInt(height, 10) : defaultHeight;
    // Note: targetQuality and targetFormat are available for future image processing
    // const targetQuality = quality ? parseInt(quality, 10) : defaultQuality;
    // const targetFormat = format || defaultFormat;

    // Handle HEIC/HEIF files - browsers don't support them natively
    const isHeic = mimeType === "image/heic" || mimeType === "image/heif";

    const accessToken = await googleDriveService.getAccessToken();
    
    // For mobile, request smaller images from Google Drive if possible
    let driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`;
    
    // Add size parameters for Google Drive API (if supported)
    if (isMobile && !isHeic) {
      driveUrl += `&w=${Math.min(targetWidth, 1920)}&h=${Math.min(targetHeight, 1080)}`;
    }

    const res = await fetch(driveUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok || !res.body) {
      return NextResponse.json({ error: "Unable to stream file" }, { status: 502 });
    }

    const headers = new Headers();
    
    // For HEIC files, serve them as-is but with proper headers for download
    if (isHeic) {
      headers.set("Content-Type", mimeType);
      headers.set("Content-Disposition", `inline; filename="${id}.heic"`);
      headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      
      // Optional: Content-Length if present
      const len = res.headers.get("content-length");
      if (len) headers.set("Content-Length", len);
      
      return new NextResponse(res.body, { status: 200, headers });
    } else {
      // For regular images, serve with optimized headers
      headers.set("Content-Type", mimeType);
      
      // Enhanced caching for mobile
      const cacheControl = isMobile 
        ? "public, s-maxage=600, stale-while-revalidate=1200, max-age=300"
        : "public, s-maxage=300, stale-while-revalidate=600";
      headers.set("Cache-Control", cacheControl);
      
      // Add performance hints
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("X-Frame-Options", "SAMEORIGIN");
      
      // Optional: Content-Length if present
      const len = res.headers.get("content-length");
      if (len) headers.set("Content-Length", len);
      
      return new NextResponse(res.body, { status: 200, headers });
    }
  } catch (error) {
    console.error("[stream] failed to stream file", error);
    return NextResponse.json({ error: "Internal error while streaming" }, { status: 500 });
  }
}
