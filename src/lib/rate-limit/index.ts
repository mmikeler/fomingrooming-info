/**
 * Rate Limiting модуль
 *
 * Экспорт всех функций для удобного использования
 */

export {
  rateLimitConfig,
  checkRateLimit,
  getRateLimitIdentifier,
  cleanupRateLimitStore,
  type RateLimitKey,
} from "./rate-limiter";

export {
  withRateLimit,
  withPublicRateLimit,
  checkPublicRateLimit,
  checkAuthRateLimit,
  type RateLimitError,
} from "./with-rate-limit";
