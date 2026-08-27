# Стиль кодирования

Этот документ описывает стандарты написания кода в проекте. Соблюдение этих правил обеспечивает консистентность и читаемость кодовой базы.

## Импорты

Порядок импортов (сверху вниз):

1. **Внешние библиотеки** (React, Next.js, Ant Design,第三方)
2. **Внутренние модули** (через алиас `@/`)
3. **Относительные импорты**

```typescript
// Внешние библиотеки
import { Button } from "antd";
import { useSession } from "next-auth/react";
import { useState } from "react";

// Внутренние модули
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { action } from "@/lib/errors";

// Относительные импорты
import { RoleGuard } from "./role-guard";
import { UserMenu } from "../user-menu";
```

### Группировка

Импорты в каждой группе разделяются пустой строкой. Внутри группы сортировка алфавитно.

## Директивы модулей

- `"use client"` — клиентские компоненты (первая строка файла)
- `"use server"` — server actions (первая строка файла)

```typescript
"use client";

import { Button } from "antd";

export function MyComponent() {
  // Component logic
}
```

## Именование

| Сущность           | Стиль            | Пример                        |
| ------------------ | ---------------- | ----------------------------- |
| Компоненты         | PascalCase       | `Header`, `PostsTable`        |
| Функции/переменные | camelCase        | `createPost`, `userMenuItems` |
| Константы          | UPPER_SNAKE_CASE | `PostStatus`                  |
| Файлы компонентов  | PascalCase       | `Header.tsx`                  |
| Файлы actions      | camelCase        | `createPost.ts`               |
| Типы/интерфейсы    | PascalCase       | `CreatedPost`, `ActionResult` |
| Классы             | PascalCase       | `UserService`                 |
| Enum значения      | UPPER_SNAKE_CASE | `UserRole.ADMIN`              |

### Файлы

- Компоненты: `PascalCase.tsx`
- Server Actions: `camelCase.ts`
- Утилиты/библиотеки: `camelCase.ts`
- Типы: `PascalCase.ts` или `index.ts` в директории

## Документация кода

JSDoc комментарии для **публичных** функций, классов и типов:

```typescript
/**
 * Создание нового поста.
 * Пост создаётся как черновик (DRAFT).
 *
 * @param data - Данные поста
 * @param authorId - ID автора
 * @returns Созданный пост с присвоенным ID
 * @throws {ValidationError} Если данные невалидны
 * @throws {UnauthorizedError} Если пользователь не авторизован
 */
export async function createPost(
  data: CreatePostData,
  authorId: number,
): Promise<ActionResult<CreatedPost>> {
  // ...
}
```

### Требования:

- **Публичные** (exported) функции/классы → обязательно
- **Приватные** (не exported) → опционально
- **Интерфейсы/типы** → обязательно при использовании в публичном API

## Обработка ошибок

Использовать иерархию классов ошибок из [`src/lib/errors/`](../../src/lib/errors/):

```typescript
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  BadRequestError,
} from "@/lib/errors";

// Базовый класс
class CustomError extends AppError {
  constructor(message: string, statusCode = 500) {
    super(message, statusCode);
    this.name = "CustomError";
  }
}

// Кидаем типизированные ошибки
if (!session) {
  throw new UnauthorizedError("Требуется вход в систему");
}

if (!title) {
  throw new ValidationError("Заголовок обязателен", {
    field: "title",
    reason: "REQUIRED",
  });
}
```

## Server Actions

Все Server Actions должны:

1. Начинаться с `"use server";`
2. Использовать обёртку `action()` из `@/lib/errors`
3. Возвращать тип `ActionResult<T>`
4. Проверять авторизацию через `getServerSession`

```typescript
"use server";

import { action } from "@/lib/errors";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createPost(
  data: CreatePostData,
): Promise<ActionResult<CreatedPost>> {
  return action(async () => {
    // Авторизация
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    // Логика
    return await prisma.post.create({
      data: {
        ...data,
        authorId: parseInt(session.user.id),
      },
    });
  });
}
```

## Логирование

Использовать Winston logger из [`src/lib/logger.ts`](../../src/lib/logger.ts):

```typescript
import { logger } from "@/lib/logger";

logger.info("Post created", { postId: 123, authorId: 456 });
logger.warn("Rate limit exceeded", { ip: "127.0.0.1", path: "/api/posts" });
logger.error("Database connection failed", error);
```

### Уровни логирования:

- `logger.error()` — ошибки, исключения, падения
- `logger.warn()` — предупреждения, превышение лимитов
- `logger.info()` — информационные события (создание, обновление)
- `logger.http()` — HTTP запросы (если нужно)
- `logger.verbose()` — детальная отладка (development)

### Контекст:

Всегда добавляйте контекст к логам:

```typescript
logger.info("User logged in", {
  userId: user.id,
  ip: request.ip,
});
```

## Комментарии

### DO comment

- Сложная бизнес-логика, неочевидные решения
- Объяснение почему, а не что
- TODO/FIXME/Comments для временных решений:

```typescript
// TODO: Рефакторить после миграции на v2 API
// FIXME: Временное решение, будет исправлено в #123
```

### DON'T comment

- Очевидный код:

```typescript
// ПЛОХО:
i++; // Increment i

// ХОРОШО:
i++; // Двигаем указатель на следующую позицию (если неочевидно)
```

- Комментарии вместо имен переменных
- Закомментированный код (удаляйте полностью)

## TypeScript особенности

### Предпочитайте тип `type` для объектов, `interface` для классов/наследования

```typescript
// type для простых объектов
type User = {
  id: number;
  name: string;
};

// interface для расширяемых структур
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

### Используйте `undefined` вместо `null` (кроме БД)

```typescript
// ПЛОХО
const email: string | null = null;

// ХОРОШО
const email?: string = undefined;
```

### Избегайте `any`

Указывайте конкретные типы. Если действительно нужен `any`, комментируйте почему:

```typescript
// @ts-expect-error: TODO: Добавить тип после обновления API
const data: any = await fetch(...);
```

### Неизменяемость

По возможности используйте `const` и неизменяемые структуры:

```typescript
const posts = await prisma.post.findMany(); // const, результат не переприсваиваем
```

Если нужна мутация, используйте let:

```typescript
let attempts = 0;
attempts++;
```

## React/Next.js правила

### Компоненты

- **Client Components**: `"use client"` на первой строке, если используют хуки (useState, useEffect)
- **Server Components**: по умолчанию, не требуют директивы
- **Именование**: PascalCase, `.tsx` расширение

### Хуки

- Правила зависимостей `exhaustive-deps` — следуйте рекомендациям ESLint
- Кастомные хуки начинаются с `use`:

```typescript
function usePosts(userId: number) {
  const [posts, setPosts] = useState<Post[]>([]);
  // ...
}
```

### Props

Используйте деструктуризацию, явные типы:

```typescript
interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  // ...
}
```

## Server Actions

- Все actions в папке `app/*/actions/`
- Именование: `camelCase.ts` (например, `createPost.ts`)
- Экспорт одной функции с именем действия
- Возвращают `ActionResult<T>`

```typescript
// app/posts/actions/createPost.ts
"use server";

export async function createPost(data: CreatePostData) {
  return action(async () => {
    // ...
  });
}
```

## Безопасность

- Никогда не логируйте пароли, токены, секреты
- Используйте environment variables через `process.env.VAR_NAME`
- Валидацию входных данных на сервере — всегда

## Производительность

- Избегайте ненужных ререндеров (`useMemo`, `useCallback`)
- Используйте `React.lazy()` для тяжёлых компонентов
- Оптимизируйте запросы к БД (N+1 problem)
- Кешируйте статичный контент

## Дополнительные ресурсы

- [Next.js Best Practices](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [React Guidelines](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
