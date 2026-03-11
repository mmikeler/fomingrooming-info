import { promises as fs } from "fs";
import path from "path";
import { sanitizeFilename } from "./image-validator";
import { getUploadPath, UploadType } from "./file-storage";
import { UserRole } from "@/generated/prisma/enums";

export interface SaveImageResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Генерирует уникальное имя файла, добавляя порядковый номер при конфликте
 * photo.jpg -> photo-1.jpg -> photo-2.jpg
 */
async function getUniqueFilename(
  uploadDir: string,
  filename: string,
): Promise<string> {
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  let uniqueName = filename;
  let counter = 1;

  while (true) {
    try {
      await fs.access(path.join(uploadDir, uniqueName));
      // Файл существует, генерируем новое имя
      uniqueName = `${baseName}-${counter}${ext}`;
      counter++;
    } catch {
      // Файл не существует, используем это имя
      break;
    }
  }

  return uniqueName;
}

/**
 * Сохраняет изображение в файловую систему
 *
 * @param file - File из FormData
 * @param userId - ID пользователя
 * @param type - тип загрузки (avatar или post-cover)
 * @param userRole - роль пользователя
 */
export async function saveImage(
  file: File,
  userId: number,
  type: UploadType,
  userRole: UserRole,
): Promise<SaveImageResult> {
  try {
    // Определяем путь для сохранения
    const relativePath = getUploadPath({ userId, type, userRole });
    const uploadDir = path.join(process.cwd(), "public", relativePath);

    // Создаём директорию если не существует
    await fs.mkdir(uploadDir, { recursive: true });

    // Санитизируем имя файла
    const sanitizedName = sanitizeFilename(file.name);

    // Получаем уникальное имя (обрабатываем дубликаты)
    const uniqueName = await getUniqueFilename(uploadDir, sanitizedName);

    // Полный путь к файлу
    const filePath = path.join(uploadDir, uniqueName);

    // Читаем содержимое файла
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Записываем файл
    await fs.writeFile(filePath, buffer);

    // Формируем URL для доступа к файлу
    // Используем относительный путь для URL
    const fileUrl = `/${relativePath}/${uniqueName}`;

    return {
      success: true,
      url: fileUrl,
      filename: uniqueName,
    };
  } catch (error) {
    console.error("Error saving image:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка при сохранении файла",
    };
  }
}

/**
 * Удаляет изображение из файловой системы
 */
export async function deleteImage(
  filePath: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Убираем начальный слэш если есть
    const cleanPath = filePath.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), "public", cleanPath);

    // Проверяем что файл существует
    await fs.access(fullPath);

    // Удаляем файл
    await fs.unlink(fullPath);

    return { success: true };
  } catch (error) {
    // Если файл не существует - это не ошибка
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { success: true };
    }

    console.error("Error deleting image:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка при удалении файла",
    };
  }
}
