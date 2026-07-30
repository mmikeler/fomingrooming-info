"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import { validateImageFile, sanitizeFilename } from "@/lib/upload/image-validator";
import { checkAuthRateLimit } from "@/lib/rate-limit";

export interface UploadMediaFileResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export async function uploadMediaFile(
  formData: FormData,
  target: "self" | "shared",
): Promise<UploadMediaFileResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Требуется авторизация" };
  }

  const rateLimit = await checkAuthRateLimit("uploadImage");
  if (rateLimit.success === false) {
    return { success: false, error: rateLimit.error.message };
  }

  const userId = session.user.id;
  const isAdmin = session.user.role.includes("ADMIN");

  if (target === "shared" && !isAdmin) {
    return { success: false, error: "Нет прав для загрузки в общие файлы" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Файл не предоставлен" };
  }

  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const uploadDir =
    target === "shared"
      ? path.join(process.cwd(), "public", "uploads", "shared")
      : path.join(process.cwd(), "public", "uploads", userId);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch {
    return { success: false, error: "Не удалось создать директорию для загрузки" };
  }

  const sanitizedName = sanitizeFilename(file.name);
  const uniqueName = await getUniqueFilename(uploadDir, sanitizedName);
  const filePath = path.join(uploadDir, uniqueName);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${target === "shared" ? "shared" : userId}/${uniqueName}`;

    return {
      success: true,
      url: fileUrl,
      filename: uniqueName,
    };
  } catch (error) {
    console.error("Error saving media file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ошибка при сохранении файла",
    };
  }
}

async function getUniqueFilename(uploadDir: string, filename: string): Promise<string> {
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  let uniqueName = filename;
  let counter = 1;

  while (true) {
    try {
      await fs.access(path.join(uploadDir, uniqueName));
      uniqueName = `${baseName}-${counter}${ext}`;
      counter++;
    } catch {
      break;
    }
  }

  return uniqueName;
}
