import { AppError } from "./errors";
import { handlePrismaError } from "./prisma";
import type { ActionResult } from "./result";
import { logger } from "@/lib/logger";

/**
 * Обёртка для Server Actions с автоматической обработкой ошибок
 *
 * @example
 * export const updateProfile = action(async () => {
 *   const session = await getServerSession(authOptions)
 *   if (!session?.user?.id) {
 *     throw new UnauthorizedError()
 *   }
 *   return prisma.user.update({ ... })
 * })
 */
export function action<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return fn()
    .then((data) => ({ success: true as const, data }))
    .catch((error: unknown) => {
      // Логируем ошибку
      logError(error);

      // Обрабатываем Prisma ошибки
      const prismaResult = handlePrismaError(error);
      if (prismaResult) {
        return prismaResult;
      }

      // Обрабатываем AppError
      if (error instanceof AppError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      // Неизвестная ошибка
      return {
        success: false,
        error: {
          code: "INTERNAL",
          message: "Внутренняя ошибка сервера",
        },
      };
    });
}

/**
 * Логирование ошибок с учётом типа
 */
function logError(error: unknown): void {
  if (error instanceof AppError) {
    // Ошибки валидации и авторизации логируем как warn
    if (error.code === "VALIDATION" || error.code === "UNAUTHORIZED") {
      logger.warn(`[${error.code}] ${error.message}`, error.details);
    } else {
      logger.error(`[${error.code}] ${error.message}`, {
        details: error.details,
        stack: error.stack,
      });
    }
  } else if (error instanceof Error) {
    logger.error("Unexpected error", {
      message: error.message,
      stack: error.stack,
    });
  } else {
    logger.error("Unknown error", { error: String(error) });
  }
}

/**
 * Обёртка для действий, которые не возвращают данных
 *
 * @example
 * export const deletePost = actionVoid(async (id: number) => {
 *   await prisma.post.delete({ where: { id } })
 * })
 */
export function actionVoid(
  fn: () => Promise<void>,
): Promise<ActionResult<void>> {
  return action(async () => {
    await fn();
    return undefined;
  });
}

/**
 * Обёртка с возможностью передачи аргументов
 * Удобна для создания типизированных action-функций
 *
 * @example
 * export const updatePost = withArgs<{ id: number; title: string }>(async ({ id, title }) => {
 *   return prisma.post.update({ where: { id }, data: { title } })
 * })
 */
export function withArgs<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
): (args: TArgs) => Promise<ActionResult<TResult>> {
  return (args: TArgs) => action(() => fn(args));
}
