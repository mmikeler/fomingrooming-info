import { UserRole } from "@/generated/prisma/enums";

export type UploadType = "avatar" | "post-cover";

export interface UploadPathOptions {
  userId: number;
  type: UploadType;
  userRole: UserRole;
}

/**
 * Возвращает путь для сохранения файла на основе типа загрузки и роли пользователя
 *
 * Структура директорий:
 * - uploads/{userId}/avatars/ - аватарки пользователей
 * - uploads/{userId}/posts/{MM-YYYY}/ - изображения постов пользователей
 * - uploads/shared/{MM-YYYY}/ - общее хранилище для админов
 */
export function getUploadPath(options: UploadPathOptions): string {
  const { userId, type, userRole } = options;
  const now = new Date();
  const monthYear = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

  // Админы используют общее хранилище
  if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
    if (type === "post-cover") {
      return `uploads/shared/${monthYear}`;
    }
    // Для аватарок админов - просто shared/avatars
    return `uploads/shared`;
  }

  // Обычные пользователи - персональная папка
  if (type === "avatar") {
    return `uploads/${userId}/avatars`;
  }
  return `uploads/${userId}/posts/${monthYear}`;
}

/**
 * Проверяет, может ли пользователь удалить указанный файл
 */
export function canDeleteFile(
  userId: number,
  userRole: UserRole,
  filePath: string,
): boolean {
  // Админы могут удалять любые файлы
  if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
    return true;
  }

  // Извлекаем путь из URL, если это URL
  const path = extractPathFromUrl(filePath) || filePath;
  const pathParts = path.split("/");

  if (pathParts[1] === "shared") {
    return false; // Пользователь не может удалять файлы из shared
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
