/**
 * Утилиты для работы с markdown контентом
 */

/**
 * Проверка, является ли абзац заголовком или изображением
 */
function isHeaderOrImage(paragraph: string): boolean {
  const trimmed = paragraph.trim();
  // Проверяем заголовки (# ## ### и т.д.)
  if (/^#{1,6}\s/.test(trimmed)) return true;
  // Проверяем изображения ![alt](url)
  if (/^!\[.*?\]\(.*?\)$/.test(trimmed)) return true;
  return false;
}

/**
 * Очистка markdown разметки из текста
 */
function cleanMarkdown(text: string): string {
  return (
    text
      // Удаляем изображения ![alt](url)
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // Удаляем заголовки # ## ### и т.д. (сохраняем текст заголовка)
      .replace(/^#{1,6}\s+/gm, "")
      // Удаляем ссылки [text](url), оставляем только текст
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Удаляем жирный текст **text** или __text__
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      // Удаляем курсив *text* или _text_
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      // Удаляем зачёркнутый текст ~~text~~
      .replace(/~~([^~]+)~~/g, "$1")
      // Удаляем inline код `code`
      .replace(/`([^`]+)`/g, "$1")
      // Удаляем блоки кода ```code```
      .replace(/```[\s\S]*?```/g, "")
      // Удаляем HTML теги
      .replace(/<[^>]+>/g, "")
      // Удаляем лишние пробелы
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Получение текстового excerpt из markdown контента
 * Пропускает заголовки и изображения, объединяет несколько абзацев
 * до достижения заданной длины
 *
 * @param content - Markdown контент
 * @param maxLength - Максимальная длина excerpt (по умолчанию 150 символов)
 * @returns Очищенный excerpt или "Нет описания"
 */
export function getExcerpt(
  content: string | null,
  maxLength: number = 150,
): string {
  if (!content) return "Нет описания";

  // Разбиваем контент на абзацы
  const paragraphs = content.split(/\n\n+/);

  // Фильтруем абзацы, оставляя только текстовые (не заголовки и не изображения)
  const textParagraphs = paragraphs.filter((p) => !isHeaderOrImage(p));

  if (textParagraphs.length === 0) return "Нет описания";

  // Объединяем абзацы до достижения нужной длины
  const combinedParts: string[] = [];
  let currentLength = 0;

  for (const paragraph of textParagraphs) {
    const cleaned = cleanMarkdown(paragraph);

    if (cleaned.length === 0) continue;

    combinedParts.push(cleaned);
    currentLength += cleaned.length;

    // Прерываем, если набрали достаточно символов (с запасом для "...")
    if (currentLength >= maxLength) break;
  }

  if (combinedParts.length === 0) return "Нет описания";

  // Объединяем все части через пробел
  const combined = combinedParts.join(" ");

  // Сокращаем до нужной длины
  return combined.length > maxLength
    ? combined.slice(0, maxLength).trim() + "..."
    : combined;
}
