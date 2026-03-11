export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Допустимые MIME-типы изображений
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Максимальный размер файла (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Минимальные размеры изображения
const MIN_WIDTH = 100;
const MIN_HEIGHT = 100;

/**
 * Валидирует MIME-тип файла
 */
export function validateMimeType(mimeType: string): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Недопустимый тип файла. Разрешены: JPEG, PNG, GIF, WebP`,
    };
  }
  return { valid: true };
}

/**
 * Валидирует размер файла
 */
export function validateFileSize(size: number): ValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Файл слишком большой. Максимальный размер: 5MB`,
    };
  }
  if (size === 0) {
    return {
      valid: false,
      error: `Файл пустой`,
    };
  }
  return { valid: true };
}

/**
 * Проверяет расширение файла
 */
export function validateExtension(filename: string): ValidationResult {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Недопустимое расширение файла. Разрешены: ${allowedExtensions.join(", ")}`,
    };
  }
  return { valid: true };
}

/**
 * Полная валидация файла
 * Примечание: проверка размеров изображения требует чтения файла,
 * поэтому она выполняется отдельно в процессоре
 */
export function validateImageFile(file: File): ValidationResult {
  // Проверяем расширение
  const extResult = validateExtension(file.name);
  if (!extResult.valid) return extResult;

  // Проверяем MIME-тип
  const mimeResult = validateMimeType(file.type);
  if (!mimeResult.valid) return mimeResult;

  // Проверяем размер
  const sizeResult = validateFileSize(file.size);
  if (!sizeResult.valid) return sizeResult;

  return { valid: true };
}

/**
 * Санитизирует имя файла
 * - Удаляет спецсимволы
 * - Заменяет пробелы на дефисы
 * - Сохраняет оригинальное имя если возможно
 */
export function sanitizeFilename(filename: string): string {
  // Получаем имя файла и расширение
  const lastDot = filename.lastIndexOf(".");
  let name = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.slice(lastDot) : "";

  // Удаляем или заменяем небезопасные символы
  // Оставляем буквы, цифры, дефисы, подчёркивания, пробелы
  name = name.replace(/[^\w\s-]/g, "");

  // Заменяем пробелы на дефисы
  name = name.replace(/\s+/g, "-");

  // Удаляем повторяющиеся дефисы
  name = name.replace(/-+/g, "-");

  // Удаляем дефисы в начале и конце
  name = name.replace(/^-+|-+$/g, "");

  // Если имя пустое после очистки, используем default
  if (!name) {
    name = "image";
  }

  return name + ext.toLowerCase();
}
