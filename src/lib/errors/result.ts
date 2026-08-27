/**
 * Стандартный тип результата для Server Actions
 *
 * @example
 * // Успешный результат
 * const result: ActionResult<User> = { success: true, data: user }
 *
 * // Ошибка
 * const result: ActionResult<User> = {
 *   success: false,
 *   error: { code: 'VALIDATION', message: 'Invalid data' }
 * }
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorInfo };

/**
 * Информация об ошибке для клиента
 */
export interface ErrorInfo {
  /** Код ошибки для программной обработки */
  code: string;
  /** Человекочитаемое сообщение */
  message: string;
  /** Дополнительные детали (опционально) */
  details?: unknown;
}
