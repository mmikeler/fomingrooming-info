"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
}

export default async function GetSharedFiles(): Promise<MediaFile[]> {
  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return [];
    }

    // Проверяем существует ли директория
    const DIR = path.join(process.cwd(), "public", "uploads", "shared");
    try {
      await fs.access(DIR);
    } catch {
      // Если директория не существует, возвращаем пустой массив
      console.log(`Not exist shared directory`);

      return [];
    }

    // Читаем содержимое директории
    const dirs = await fs.readdir(DIR, { recursive: true });

    // Выходим при пустой директории
    if (dirs.length === 0) {
      return [];
    }

    // Фильтруем только изображения
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const imageFiles = dirs.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // Получаем информацию о файлах
    const mediaFiles: MediaFile[] = [];

    for (const filename of imageFiles) {
      const name = filename.replaceAll("\\", "/");
      const filePath = path.join(DIR, filename);
      const stats = await fs.stat(filePath);

      mediaFiles.push({
        id: `shared-${filename}`,
        name: name.split("/").pop() || name,
        url: `/uploads/shared/${name}`,
        size: stats.size,
        type: path.extname(filename).toLowerCase(),
        createdAt: stats.birthtime,
      });
    }

    // Сортируем по дате создания (новые сначала)
    mediaFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return mediaFiles;
  } catch (error) {
    console.error("Error getting user media files:", error);
    return [];
  }
}
