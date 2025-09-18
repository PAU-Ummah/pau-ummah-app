import { NextRequest, NextResponse } from "next/server";
import { googleDriveService } from "@/lib/google-drive";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json({ error: "Google Drive folder not configured" }, { status: 500 });
  }

  try {
    await googleDriveService.authenticate();
    const metadata = await googleDriveService.getFileMetadata(params.id);
    const streamUrl = await googleDriveService.generateStreamUrl(params.id);
    const thumbnail = await googleDriveService.generateThumbnail(params.id);

    return NextResponse.json({ ...metadata, streamUrl, thumbnail });
  } catch (error) {
    console.error("Failed to fetch media metadata", error);
    return NextResponse.json({ error: "Unable to fetch media metadata" }, { status: 500 });
  }
}
