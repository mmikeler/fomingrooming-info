"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImage, deleteImage } from "@/lib/upload/image-processor";
import { validateImageFile } from "@/lib/upload/image-validator";
import { canDeleteFile } from "@/lib/upload/file-storage";
import { UploadType } from "@/lib/upload/file-storage";
import { checkAuthRateLimit } from "@/lib/rate-limit";

export interface UploadImageResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Server Action для загрузки изображения
 */
export async function uploadImage(
  formData: FormData,
  type: UploadType,
): Promise<UploadImageResult> {
  // Проверяем аутентификацию
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Требуется авторизация" };
  }

  // Применяем rate limiting для защиты от злоупотреблений хранилищем
  const rateLimit = await checkAuthRateLimit("uploadImage");

  if (rateLimit.success === false) {
    return { success: false, error: rateLimit.error.message };
  }

  const userId = parseInt(session.user.id, 10);
  if (isNaN(userId)) {
    return { success: false, error: "Неверный ID пользователя" };
  }

  // Получаем роль пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return { success: false, error: "Пользователь не найден" };
  }

  // Получаем файл из FormData
  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Файл не предоставлен" };
  }

  // Валидируем файл
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Сохраняем изображение
  const result = await saveImage(file, userId, type, user.role);

  return result;
}

/**
 * Server Action для удаления изображения
 */
export async function deleteImageAction(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  // Проверяем аутентификацию
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Требуется авторизация" };
  }

  const userId = parseInt(session.user.id, 10);
  if (isNaN(userId)) {
    return { success: false, error: "Неверный ID пользователя" };
  }

  // Получаем роль пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return { success: false, error: "Пользователь не найден" };
  }

  // Проверяем права на удаление
  if (!canDeleteFile(userId, user.role, url)) {
    return { success: false, error: "Нет прав для удаления этого файла" };
  }

  // Удаляем изображение
  return deleteImage(url);
}
