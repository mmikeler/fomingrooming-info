import { UserRole } from "@/generated/prisma/enums";

export type UploadType = "avatars" | "own" | "shared" | "banners";

export interface UploadPathOptions {
  userId: number;
  type: UploadType;
  userRole?: UserRole;
}

/**
 * Возвращает путь для сохранения файла на основе типа загрузки и роли пользователя
 *
 * Структура директорий:
 * - uploads/{userId}/avatar/ - аватарки пользователей
 * - uploads/{userId}/own/{MM-YYYY}/ - личные изображения пользователей
 * - uploads/shared/{MM-YYYY}/ - общее хранилище (для админов)
 * - uploads/banners/{MM-YYYY}/ - общее хранилище баннеров (для админов)
 */
export function getUploadPath(options: UploadPathOptions): string {
  const { userId, type } = options;
  const now = new Date();
  const monthYear = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

  // Использовать общее хранилище
  if (type === "shared" || type === "banners") {
    return `uploads/${type}/${monthYear}`;
  }

  // Обычные пользователи - персональная папка
  if (type === "avatars") {
    return `uploads/${userId}/avatars`;
  }
  return `uploads/${userId}/own/${monthYear}`;
}

/**
 * Проверяет, может ли пользователь удалить указанный файл
 */
export function canDeleteFile(
  userId: number,
  userRole: UserRole,
  filePath: string,
): boolean {
  if (userRole === "SUPERADMIN") {
    return true;
  }

  const path = extractPathFromUrl(filePath) || filePath;
  const pathParts = path.split("/");

  if (pathParts[1].match(/shared|banners/)) {
    return false;
  }

  const fileUserId = parseInt(pathParts[1], 10);
  return fileUserId === userId;
}

/**
 * Извлекает относительный путь из полного URL
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Убираем начальный слэш
    return urlObj.pathname.substring(1);
  } catch {
    // Если URL относительный, возвращаем как есть
    return url.replace(/^\//, "");
  }
}
