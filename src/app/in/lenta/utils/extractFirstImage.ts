/**
 * Извлекает URL первого изображения из контента (markdown или HTML)
 * @param content - Контент в формате markdown или HTML
 * @returns URL первого изображения или null, если не найдено
 */
export function extractFirstImageFromContent(
  content: string | null | undefined,
): string | null {
  if (!content) {
    return null;
  }

  // 1. Ищем markdown изображения: ![alt](url) или ![alt](url "title")
  const markdownImgRegex =
    /!\[([^\]]*)\]\(([^\s\)"]+)(?:\s+["']([^"']+)["'])?\)/gi;
  const markdownMatch = markdownImgRegex.exec(content);
  if (markdownMatch && markdownMatch[2]) {
    return markdownMatch[2];
  }

  // 2. Ищем HTML теги <img> (если markdown содержит HTML)
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const htmlMatch = htmlImgRegex.exec(content);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }

  return null;
}

/**
 * Проверяет, является ли URL абсолютным (полным) или относительным
 * @param url - URL для проверки
 * @returns true, если URL абсолютный
 */
export function isAbsoluteUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  );
}

/**
 * Получает полный URL изображения для использования в компонентах
 * @param imageUrl - URL изображения (может быть относительным)
 * @returns полный URL изображения
 */
export function getFullImageUrl(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) {
    return null;
  }

  // Если URL уже абсолютный, возвращаем как есть
  if (isAbsoluteUrl(imageUrl)) {
    return imageUrl;
  }

  // Если URL относительный, добавляем базовый путь
  // Используем переменную окружения или значение по умолчанию
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  return `${baseUrl}${imageUrl}`;
}
