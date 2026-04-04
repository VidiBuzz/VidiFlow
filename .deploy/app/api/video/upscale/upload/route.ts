import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = "/mnt/m/code/vidismart/VidiFlow/uploads";
const OUTPUT_DIR = "/mnt/m/code/vidismart/VidiFlow/outputs";
const COMFYUI_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get("video") as File;

    if (!video) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/avi", "video/quicktime", "video/x-matroska", "video/webm"];
    if (!allowedTypes.includes(video.type)) {
      return NextResponse.json(
        { error: "Invalid video format. Allowed: MP4, AVI, MOV, MKV, WEBM" },
        { status: 400 }
      );
    }

    // Create directories if they don't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(OUTPUT_DIR)) {
      await mkdir(OUTPUT_DIR, { recursive: true });
    }

    // Save file
    const filename = `${uuidv4()}_${video.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      originalName: video.name,
      size: video.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
