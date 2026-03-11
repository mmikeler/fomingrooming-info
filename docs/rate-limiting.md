# Rate Limiting — Стратегия и Рекомендации

## Обзор

В данном документе представлены рекомендации по реализации rate limiting (ограничения частоты запросов) для ключевых точек приложения **Fomingrooming Info**. Приложение построено на Next.js 16 с использованием Server Actions и Prisma.

---

## 1. Категории Endpoint-ов и Приоритеты

### 1.1 Критические (Critical)

| Endpoint             | Файл                                                                                                                 | Описание                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Регистрация          | [`src/app/auth/signup/actions/register.ts`](src/app/auth/signup/actions/register.ts)                                 | Создание новых аккаунтов          |
| Запрос сброса пароля | [`src/app/auth/forgot-password/actions/forgot-password.ts`](src/app/auth/forgot-password/actions/forgot-password.ts) | Отправка ссылок для сброса пароля |
| Вход в систему       | NextAuth (`[...nextauth]`)                                                                                           | Аутентификация пользователей      |
| Загрузка изображений | [`src/app/actions/upload-image.ts`](src/app/actions/upload-image.ts)                                                 | Загрузка файлов на сервер         |

### 1.2 Высокий приоритет (High)

| Endpoint          | Файл                                                                                         | Описание                   |
| ----------------- | -------------------------------------------------------------------------------------------- | -------------------------- |
| Создание поста    | [`src/app/profile/posts/actions/createPost.ts`](src/app/profile/posts/actions/createPost.ts) | Публикация нового контента |
| Обновление поста  | [`src/app/profile/posts/actions/updatePost.ts`](src/app/profile/posts/actions/updatePost.ts) | Редактирование контента    |
| Изменение пароля  | [`src/app/profile/actions/changePassword.ts`](src/app/profile/actions/changePassword.ts)     | Смена пароля пользователя  |
| Изменение профиля | [`src/app/profile/actions/updateProfile.ts`](src/app/profile/actions/updateProfile.ts)       | Обновление данных профиля  |

### 1.3 Средний приоритет (Medium)

| Endpoint          | Файл                                                                                                             | Описание                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Верификация email | [`src/app/auth/verify-email/actions/verify-email.ts`](src/app/auth/verify-email/actions/verify-email.ts)         | Подтверждение email       |
| Сброс пароля      | [`src/app/auth/reset-password/actions/reset-password.ts`](src/app/auth/reset-password/actions/reset-password.ts) | Установка нового пароля   |
| Проверка slug     | [`src/app/profile/posts/actions/checkSlug.ts`](src/app/profile/posts/actions/checkSlug.ts)                       | Проверка уникальности URL |
| Удаление поста    | [`src/app/profile/posts/actions/deletePost.ts`](src/app/profile/posts/actions/deletePost.ts)                     | Удаление контента         |

### 1.4 Низкий приоритет (Low)

| Endpoint                | Файл                                                                                             | Описание                 |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| Получение списка постов | [`src/app/profile/posts/actions/getUserPosts.ts`](src/app/profile/posts/actions/getUserPosts.ts) | Чтение данных            |
| Получение профиля       | [`src/app/profile/actions/getUser.ts`](src/app/profile/actions/getUser.ts)                       | Чтение данных            |
| Модерация               | [`src/app/moderation/actions/moderatePost.ts`](src/app/moderation/actions/moderatePost.ts)       | Административные функции |
| Admin функции           | [`src/app/admin/actions/updateUserRole.ts`](src/app/admin/actions/updateUserRole.ts)             | Административные функции |

---

## 2. Рекомендуемые Лимиты

### 2.1 Критические endpoints

```yaml
register:
  anonymous: "5 requests / hour per IP"
  authenticated: "3 requests / hour per user"
  reason: Предотвращение спам-регистраций и злоупотреблений

forgot-password:
  anonymous: "3 requests / hour per IP"
  reason: Защита от перебора email-адресов и флуда email-сообщениями

login (NextAuth):
  anonymous: "10 attempts / hour per IP"
  reason: Защита от брутфорс-атак на пароли

upload-image:
  authenticated: "20 uploads / hour per user"
  reason: Защита от злоупотребления хранилищем и DDoS
```

### 2.2 High priority endpoints

```yaml
createPost:
  authenticated: "10 posts / hour per user"
  reason: Предотвращение спама и злоупотреблений контентом

updatePost:
  authenticated: "30 updates / hour per user"
  reason: Ограничение частоты редактирования

changePassword:
  authenticated: "5 attempts / hour per user"
  reason: Защита от перебора паролей

updateProfile:
  authenticated: "10 updates / hour per user"
  reason: Ограничение частоты обновления профиля
```

### 2.3 Medium priority endpoints

```yaml
verifyEmail:
  rate: "10 requests / hour per user"

resetPassword:
  anonymous: "5 attempts / hour per IP"

checkSlug:
  authenticated: "20 requests / hour per user"

deletePost:
  authenticated: "20 deletes / hour per user"
```

### 2.4 Low priority endpoints

```yaml
getUserPosts:
  authenticated: "60 requests / hour per user"

getUser:
  authenticated: "60 requests / hour per user"

moderatePost:
  moderator: "100 requests / hour per user"

updateUserRole (admin):
  admin: "50 requests / hour per user"
```

---

## 3. Варианты Реализации

### 3.1 Встроенное решение (In-Memory)

Для небольших проектов или development-режима можно использовать простое in-memory хранилище.

**Плюсы:**

- Не требует внешних зависимостей
- Простая интеграция
- Быстрая скорость работы

**Минусы:**

- Не работает в cluster mode
- Сбрасывается при перезагрузке сервера
- Не подходит для production с несколькими инстансами

**Пример реализации:**

```typescript
// src/lib/rate-limit/simple-rate-limiter.ts
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment counter
  entry.count++;
  store.set(key, entry);
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}
```

### 3.2 Redis-based решение (Рекомендуется для Production)

Для production-окружения с несколькими инстансами рекомендуется использовать Redis.

**Плюсы:**

- Работает в cluster mode
- Сохраняет состояние между перезагрузками
- Высокая производительность
- Централизованное хранение

**Минусы:**

- Требует Redis сервер
- Дополнительная зависимость

**Рекомендуемая библиотека:** `rate-limiter-flexible` + `ioredis`

```bash
npm install rate-limiter-flexible ioredis @types/ioredis
```

**Пример реализации:**

```typescript
// src/lib/rate-limit/redis-rate-limiter.ts
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import Redis from "ioredis";

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

// Для production используем Redis
const rateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ratelimit",
  points: 10, // количество запросов
  duration: 60, // за 60 секунд
  blockDuration: 0,
});

// Для development используем in-memory
const rateLimiterMemory = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

const rateLimiter = process.env.REDIS_URL
  ? rateLimiterRedis
  : rateLimiterMemory;

export async function checkRateLimit(
  key: string,
  points: number = 1,
): Promise<{
  allowed: boolean;
  remainingPoints: number;
  msBeforeNext: number;
}> {
  try {
    const result = await rateLimiter.consume(key, points);
    return {
      allowed: true,
      remainingPoints: result.remainingPoints,
      msBeforeNext: result.msBeforeNext,
    };
  } catch (rejected) {
    return {
      allowed: false,
      remainingPoints: rejected.remainingPoints,
      msBeforeNext: rejected.msBeforeNext,
    };
  }
}
```

### 3.3 Next.js Middleware решение

Для API routes и Server Actions можно использовать Next.js middleware.

**Плюсы:**

- Работает на уровне запросов
- Не требует изменения логики Server Actions
- Можно ограничивать по IP, path, и другим параметрам

**Пример:**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  // Применяем только к определенным путям
  if (
    !request.nextUrl.pathname.startsWith("/api/") &&
    !request.nextUrl.pathname.startsWith("/auth/")
  ) {
    return NextResponse.next();
  }

  const ip = request.ip || "unknown";
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 минута
  const limit = 10;

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return NextResponse.next();
  }

  if (entry.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetTime - now) / 1000)),
        },
      },
    );
  }

  entry.count++;
  rateLimitMap.set(key, entry);

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(limit - entry.count));
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/auth/:path*"],
};
```

---

## 4. Интеграция с Server Actions

### 4.1 Универсальная обёртка для Rate Limiting

```typescript
// src/lib/rate-limit/action-wrapper.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "./redis-rate-limiter";

export interface RateLimitConfig {
  points: number; // количество запросов
  duration: number; // окно в секундах
  keyPrefix: string; // префикс для ключа
}

export async function withRateLimit<T>(
  config: RateLimitConfig,
  action: () => Promise<T>,
): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  retryAfter?: number;
}> {
  // Получаем сессию для идентификации пользователя
  const session = await getServerSession(authOptions);

  // Формируем ключ: IP для анонимных, userId для авторизованных
  const ip = "unknown"; // В Next.js можно получить из headers
  const userId = session?.user?.id;
  const identifier = userId || ip;
  const key = `${config.keyPrefix}:${identifier}`;

  const result = await checkRateLimit(key, config.points);

  if (!result.allowed) {
    return {
      success: false,
      error: "Превышен лимит запросов. Попробуйте позже.",
      retryAfter: Math.ceil(result.msBeforeNext / 1000),
    };
  }

  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    throw error; // Пробрасываем ошибки дальше
  }
}
```

### 4.2 Пример применения к register action

```typescript
// src/app/auth/signup/actions/register.ts
import { withRateLimit } from "@/lib/rate-limit/action-wrapper";

export async function register(
  data: RegisterData,
): Promise<ActionResult<RegisteredUser>> {
  // Применяем rate limiting
  const rateLimitResult = await withRateLimit(
    {
      points: 5,
      duration: 3600, // 1 час
      keyPrefix: "register",
    },
    async () => {
      // ... оригинальная логика регистрации
    },
  );

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: rateLimitResult.error!,
        details: { retryAfter: rateLimitResult.retryAfter },
      },
    };
  }

  return rateLimitResult.data;
}
```

---

## 5. Конфигурация по Окружениям

### Development

```typescript
// src/lib/rate-limit/config.ts
export const rateLimitConfig = {
  // Простые in-memory лимиты для разработки
  register: { points: 10, duration: 60 },
  forgotPassword: { points: 5, duration: 60 },
  login: { points: 20, duration: 60 },
  uploadImage: { points: 50, duration: 60 },
  createPost: { points: 20, duration: 60 },
};
```

### Production

```typescript
// src/lib/rate-limit/config.ts
export const rateLimitConfig = {
  // Более строгие лимиты для production
  register: { points: 5, duration: 3600 }, // 5 в час
  forgotPassword: { points: 3, duration: 3600 }, // 3 в час
  login: { points: 10, duration: 3600 }, // 10 в час
  uploadImage: { points: 20, duration: 3600 }, // 20 в час
  createPost: { points: 10, duration: 3600 }, // 10 в час
};
```

---

## 6. Рекомендации по Реализации

### Приоритет 1: Критические endpoints

1. **register** — защита от спам-регистраций
2. **forgot-password** — защита от флуда email-рассылками
3. **login** — защита от брутфорс-атак

### Приоритет 2: Защита от злоупотреблений

1. **upload-image** — защита хранилища
2. **createPost/updatePost** — защита от спама

### Приоритет 3: Оптимизация производительности

1. Чтение данных (getUser, getUserPosts)
2. API endpoints

---

## 7. Мониторинг и Логирование

Рекомендуется логировать все случаи превышения лимитов:

```typescript
import { logger } from "@/lib/logger";

// При превышении лимита
logger.warn("Rate limit exceeded", {
  key,
  ip,
  path,
  timestamp: new Date().toISOString(),
});
```

---

## 8. Выводы

| Подход                         | Когда использовать             | Сложность |
| ------------------------------ | ------------------------------ | --------- |
| In-Memory                      | Development, small projects    | Низкая    |
| Redis                          | Production, multiple instances | Средняя   |
| Middleware                     | Global rate limiting           | Средняя   |
| Third-party (Cloudflare, etc.) | Enterprise solutions           | Высокая   |

**Рекомендация:** Начать с простого in-memory решения, затем перейти на Redis для production.```
