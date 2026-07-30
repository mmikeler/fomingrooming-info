"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
}

export interface UserMediaResponse {
  self: MediaFile[];
  shared?: MediaFile[];
  userRole?: string;
}

export default async function GetUserMediaFiles(): Promise<UserMediaResponse> {
  const files: UserMediaResponse = {
    self: [],
    shared: [],
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return files;
    }

    const userId = session.user.id;
    const isAdmin = session.user.role.includes("ADMIN");
    files.userRole = session.user.role;

    const userUploadDir = path.join(process.cwd(), "public", "uploads", userId);
    const sharedUploadDir = path.join(process.cwd(), "public", "uploads", "shared");

    const dirsToRead = [userUploadDir];
    if (isAdmin) {
      dirsToRead.push(sharedUploadDir);
    }

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

    for (const [index, dir] of dirsToRead.entries()) {
      try {
        await fs.access(dir);
      } catch {
        continue;
      }

      const dirs = await fs.readdir(dir, { recursive: true });
      if (dirs.length === 0) continue;

      const imageFiles = dirs.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      });

      const mediaFiles: MediaFile[] = [];

      for (const filename of imageFiles) {
        const name = filename.replaceAll("\\", "/");
        const filePath = path.join(dir, filename);
        const stats = await fs.stat(filePath);

        mediaFiles.push({
          id: `${index === 0 ? userId : "shared"}-${filename}`,
          name: name.split("/").pop() || name,
          url: `/uploads/${index === 0 ? userId : "shared"}/${name}`,
          size: stats.size,
          type: path.extname(filename).toLowerCase(),
          createdAt: stats.birthtime,
        });
      }

      mediaFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      if (index === 0) {
        files.self = mediaFiles;
      } else {
        files.shared = mediaFiles;
      }
    }

    return files;
  } catch (error) {
    console.error("Error getting user media files:", error);
    return files;
  }
}
