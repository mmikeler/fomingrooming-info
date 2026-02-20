import { Prisma } from "../../generated/prisma/client";
import type { ActionResult } from "./result";

/**
 * Обработчик ошибок Prisma
 * Преобразует Prisma ошибки в стандартный формат ActionResult
 */
export function handlePrismaError(error: unknown): ActionResult<never> | null {
  if (!isPrismaKnownError(error)) {
    return null;
  }

  switch (error.code) {
    case "P2002": {
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] ?? "record";
      return {
        success: false,
        error: {
          code: "CONFLICT",
          message: `Запись с таким ${field} уже существует`,
          details: { field, target },
        },
      };
    }

    case "P2025": {
      // Record not found
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Запись не найдена",
        },
      };
    }

    case "P2003": {
      // Foreign key constraint violation
      const field = error.meta?.field_name as string | undefined;
      return {
        success: false,
        error: {
          code: "DATABASE",
          message: "Нарушение связи между записями",
          details: { field },
        },
      };
    }

    case "P2014": {
      // Relation violation
      return {
        success: false,
        error: {
          code: "DATABASE",
          message: "Нарушение отношения между записями",
          details: error.meta,
        },
      };
    }

    case "P2001": {
      // Record does not exist
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Запись не существует",
          details: error.meta,
        },
      };
    }

    default: {
      // Other Prisma errors
      return {
        success: false,
        error: {
          code: "DATABASE",
          message: "Ошибка базы данных",
          details: {
            prismaCode: error.code,
            meta: error.meta,
          },
        },
      };
    }
  }
}

/**
 * Type guard для проверки Prisma ошибки
 */
function isPrismaKnownError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Проверяет, является ли ошибка Prisma ошибкой уникальности
 */
export function isUniqueConstraintError(
  error: unknown,
  field?: string,
): boolean {
  if (!isPrismaKnownError(error)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  if (field) {
    const target = error.meta?.target as string[] | undefined;
    return target?.includes(field) ?? false;
  }

  return true;
}

/**
 * Проверяет, является ли ошибка Prisma ошибкой "не найдено"
 */
export function isNotFoundError(error: unknown): boolean {
  return isPrismaKnownError(error) && error.code === "P2025";
}
