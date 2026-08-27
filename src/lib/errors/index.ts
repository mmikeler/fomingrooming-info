/**
 * Централизованная обработка ошибок
 *
 * @example
 * // В server action:
 * import { action, ValidationError, UnauthorizedError } from '@/lib/errors'
 *
 * export const updateProfile = action(async () => {
 *   const session = await getServerSession(authOptions)
 *   if (!session?.user?.id) {
 *     throw new UnauthorizedError()
 *   }
 *   if (!name?.trim()) {
 *     throw new ValidationError('Имя обязательно', { name: 'Обязательное поле' })
 *   }
 *   return prisma.user.update({ ... })
 * })
 *
 * // На клиенте:
 * const result = await updateProfile('John')
 * if (result.success) {
 *   console.log(result.data) // обновлённый пользователь
 * } else {
 *   console.log(result.error.code) // 'VALIDATION'
 *   console.log(result.error.message) // 'Имя обязательно'
 * }
 */

// Классы ошибок
export {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  BadRequestError,
} from "./errors";

// Типы
export type { ActionResult, ErrorInfo } from "./result";

// Обёртки для server actions
export { action, actionVoid, withArgs } from "./wrapper";

// Утилиты для работы с Prisma ошибками
export { isUniqueConstraintError, isNotFoundError } from "./prisma";
