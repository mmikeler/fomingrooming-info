/**
 * Базовый класс для всех ошибок приложения
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка валидации данных
 * Используется при некорректных входных данных
 */
export class ValidationError extends AppError {
  readonly code = "VALIDATION";

  constructor(message: string, fields?: Record<string, string>) {
    super(message, fields ? { fields } : undefined);
  }
}

/**
 * Ошибка авторизации
 * Используется когда пользователь не аутентифицирован
 */
export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";

  constructor(message = "Требуется авторизация") {
    super(message);
  }
}

/**
 * Ошибка доступа
 * Используется когда у пользователя нет прав на действие
 */
export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";

  constructor(message = "Доступ запрещён") {
    super(message);
  }
}

/**
 * Ошибка "не найдено"
 * Используется когда запрашиваемый ресурс не существует
 */
export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";

  constructor(resource: string, id?: string | number) {
    super(`${resource} не найден`, { resource, id });
  }
}

/**
 * Ошибка конфликта
 * Используется при нарушении уникальности или других конфликтных ситуациях
 */
export class ConflictError extends AppError {
  readonly code = "CONFLICT";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

/**
 * Ошибка базы данных
 * Используется при ошибках Prisma и других БД-ошибках
 */
export class DatabaseError extends AppError {
  readonly code = "DATABASE";

  constructor(
    message = "Ошибка базы данных",
    details?: Record<string, unknown>,
  ) {
    super(message, details);
  }
}

/**
 * Ошибка некорректного запроса
 * Используется когда запрос не может быть выполнен из-за некорректного состояния
 */
export class BadRequestError extends AppError {
  readonly code = "BAD_REQUEST";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
