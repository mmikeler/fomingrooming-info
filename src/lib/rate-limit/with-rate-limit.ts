/**
 * Хелпер для интеграции rate limiting с Server Actions
 *
 * Использование:
 * ```typescript
 * export async function myAction(data: SomeData) {
 *   return withRateLimit('register', async () => {
 *     // Ваша логика
 *     return { success: true };
 *   });
 * }
 * ```
 */

import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  type RateLimitKey,
} from "./rate-limiter";

export interface RateLimitError {
  code: "RATE_LIMITED";
  message: string;
  details: {
    remainingSeconds?: number;
    resetTime?: number;
  };
}

/**
 * Выполняет action с проверкой rate limit
 *
 * @param configName - Имя конфигурации из rateLimitConfig
 * @param action - Async функция для выполнения
 * @returns Результат выполнения action или ошибка rate limiting
 */
export async function withRateLimit<T>(
  configName: RateLimitKey,
  action: () => Promise<T>,
): Promise<T | { success: false; error: RateLimitError }> {
  // Получаем headers для определения IP
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headersList.get("x-real-ip") || null;

  // Получаем сессию для определения userId
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;

  // Формируем идентификатор
  const identifier = getRateLimitIdentifier(ip, userId);

  // Проверяем rate limit
  const result = checkRateLimit(identifier, configName);

  if (!result.allowed) {
    const remainingSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);

    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Превышен лимит запросов. Попробуйте позже.",
        details: {
          remainingSeconds,
          resetTime: result.resetTime,
        },
      },
    };
  }

  // Выполняем action
  try {
    return await action();
  } catch (error) {
    // Пробрасываем ошибки дальше
    throw error;
  }
}

/**
 * Выполняет action с проверкой rate limit для публичных endpoints
 * Только по IP (без авторизации)
 *
 * @param configName - Имя конфигурации
 * @param action - Async функция
 */
export async function withPublicRateLimit<T>(
  configName: RateLimitKey,
  action: () => Promise<T>,
): Promise<T | { success: false; error: RateLimitError }> {
  // Получаем только IP (без userId)
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headersList.get("x-real-ip") || "unknown";

  // Проверяем rate limit только по IP
  const result = checkRateLimit(ip, configName);

  if (!result.allowed) {
    const remainingSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);

    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Превышен лимит запросов. Попробуйте позже.",
        details: {
          remainingSeconds,
          resetTime: result.resetTime,
        },
      },
    };
  }

  try {
    return await action();
  } catch (error) {
    throw error;
  }
}

/**
 * Проверка rate limit без выполнения action (только для публичных endpoints)
 *
 * @param configName - Имя конфигурации
 * @returns Результат проверки: success: true или success: false с ошибкой
 */
export async function checkPublicRateLimit(
  configName: RateLimitKey,
): Promise<{ success: true } | { success: false; error: RateLimitError }> {
  // Получаем только IP (без userId)
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headersList.get("x-real-ip") || "unknown";

  // Проверяем rate limit только по IP
  const result = checkRateLimit(ip, configName);

  if (!result.allowed) {
    const remainingSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);

    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Превышен лимит запросов. Попробуйте позже.",
        details: {
          remainingSeconds,
          resetTime: result.resetTime,
        },
      },
    };
  }

  return { success: true };
}

/**
 * Проверка rate limit без выполнения action (для авторизованных endpoints)
 *
 * @param configName - Имя конфигурации
 * @returns Результат проверки: success: true или success: false с ошибкой
 */
export async function checkAuthRateLimit(
  configName: RateLimitKey,
): Promise<{ success: true } | { success: false; error: RateLimitError }> {
  // Получаем headers для определения IP
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headersList.get("x-real-ip") || null;

  // Получаем сессию для определения userId
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;

  // Формируем идентификатор
  const identifier = getRateLimitIdentifier(ip, userId);

  // Проверяем rate limit
  const result = checkRateLimit(identifier, configName);

  if (!result.allowed) {
    const remainingSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);

    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Превышен лимит запросов. Попробуйте позже.",
        details: {
          remainingSeconds,
          resetTime: result.resetTime,
        },
      },
    };
  }

  return { success: true };
}
