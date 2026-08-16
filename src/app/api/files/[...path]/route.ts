import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathSegments } = await params;
    const requestedPath = pathSegments.join("/");

    const normalizedPath = path.normalize(requestedPath);
    const fullPath = path.join(UPLOAD_ROOT, normalizedPath);

    if (!fullPath.startsWith(UPLOAD_ROOT)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    let stats;
    try {
      stats = await fs.stat(fullPath);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!stats.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(fullPath);
    const contentType = getContentType(fullPath);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", fileBuffer.length.toString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Content-Disposition", `inline; filename="${path.basename(fullPath)}"`);

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
