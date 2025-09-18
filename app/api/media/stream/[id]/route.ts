import { NextRequest, NextResponse } from "next/server";
import { googleDriveService } from "@/lib/google-drive";

// Streams image content from Google Drive via the server, using the service account.
// GET /api/media/stream/:id
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const accessToken = await googleDriveService.getAccessToken();
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`;

    const res = await fetch(driveUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok || !res.body) {
      return NextResponse.json({ error: "Unable to stream file" }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    // Pass through caching headers for better performance (adjust as needed)
    headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

    // Optional: Content-Length if present
    const len = res.headers.get("content-length");
    if (len) headers.set("Content-Length", len);

    return new NextResponse(res.body, { status: 200, headers });
  } catch (error) {
    console.error("[stream] failed to stream file", error);
    return NextResponse.json({ error: "Internal error while streaming" }, { status: 500 });
  }
}
