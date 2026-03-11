/**
 * In-Memory Rate Limiter
 *
 * Простое решение для ограничения частоты запросов.
 * Подходит для development режима и небольших проектов.
 *
 * ВНИМАНИЕ: Не рекомендуется для production с несколькими инстансами.
 */

import { logger } from "@/lib/logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/** Хранилище для rate limiting (in-memory) */
const store = new Map<string, RateLimitEntry>();

/** Максимальное количество записей в хранилище */
const MAX_STORE_SIZE = 10000;

/**
 * Очистка старых записей при достижении максимального размера
 */
function evictOldEntriesIfNeeded(): void {
  if (store.size >= MAX_STORE_SIZE) {
    const now = Date.now();
    // Удаляем все просроченные записи
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
    // Если всё ещё слишком много - очищаем самые старые
    if (store.size >= MAX_STORE_SIZE * 0.8) {
      const entries = Array.from(store.entries());
      entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
      const toRemove = Math.floor(MAX_STORE_SIZE * 0.3);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        store.delete(entries[i][0]);
      }
      logger.info("Rate limit store evicted entries", {
        removed: toRemove,
        remaining: store.size,
      });
    }
  }
}

/**
 * Конфигурация rate limit для разных endpoints
 */
export const rateLimitConfig = {
  // Критические endpoints
  register: { points: 5, windowMs: 60 * 60 * 1000 }, // 5 запросов в час
  forgotPassword: { points: 3, windowMs: 60 * 60 * 1000 }, // 3 запроса в час
  login: { points: 10, windowMs: 60 * 60 * 1000 }, // 10 попыток в час

  // High priority
  createPost: { points: 10, windowMs: 60 * 60 * 1000 }, // 10 постов в час
  updatePost: { points: 30, windowMs: 60 * 60 * 1000 }, // 30 обновлений в час
  changePassword: { points: 5, windowMs: 60 * 60 * 1000 }, // 5 попыток в час
  updateProfile: { points: 10, windowMs: 60 * 60 * 1000 }, // 10 обновлений в час

  // Medium priority
  verifyEmail: { points: 10, windowMs: 60 * 60 * 1000 },
  resetPassword: { points: 5, windowMs: 60 * 60 * 1000 },
  resendVerification: { points: 3, windowMs: 60 * 60 * 1000 }, // 3 запроса в час
  checkSlug: { points: 20, windowMs: 60 * 60 * 1000 },
  deletePost: { points: 20, windowMs: 60 * 60 * 1000 },

  // Upload
  uploadImage: { points: 60, windowMs: 60 * 60 * 1000 }, // 60 загрузок в час

  // Low priority (чтение данных)
  getUserPosts: { points: 60, windowMs: 60 * 60 * 1000 },
  getUser: { points: 60, windowMs: 60 * 60 * 1000 },
  moderatePost: { points: 100, windowMs: 60 * 60 * 1000 },
  updateUserRole: { points: 50, windowMs: 60 * 60 * 1000 },
} as const;

export type RateLimitKey = keyof typeof rateLimitConfig;

/**
 * Проверка rate limit для заданного ключа
 *
 * @param key - Уникальный идентификатор (IP или userId)
 * @param configName - Имя конфигурации из rateLimitConfig
 * @returns Результат проверки: allowed, remaining, resetTime
 */
export function checkRateLimit(
  key: string,
  configName: RateLimitKey,
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = rateLimitConfig[configName];
  const now = Date.now();
  const fullKey = `${configName}:${key}`;

  // Проверяем необходимость очистки при достижении лимита
  evictOldEntriesIfNeeded();

  const entry = store.get(fullKey);

  // Новый период или запись истекла
  if (!entry || now > entry.resetTime) {
    store.set(fullKey, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.points - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Лимит превышен
  if (entry.count >= config.points) {
    // Логируем превышение лимита
    logger.warn("Rate limit exceeded", {
      key: fullKey,
      configName,
      count: entry.count,
      limit: config.points,
      resetTime: entry.resetTime,
      timestamp: new Date().toISOString(),
    });

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Увеличиваем счётчик
  entry.count++;
  store.set(fullKey, entry);

  return {
    allowed: true,
    remaining: config.points - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Утилита для получения идентификатора (IP или userId)
 */
export function getRateLimitIdentifier(
  ip?: string | null,
  userId?: string | null,
): string {
  return userId || ip || "unknown";
}

/**
 * Очистка устаревших записей (можно вызывать периодически)
 *
 * Рекомендуется вызывать раз в несколько минут для очистки памяти
 */
export function cleanupRateLimitStore(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Автоматическая очистка каждые 5 минут
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
