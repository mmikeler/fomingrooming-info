# Централизованная обработка ошибок

## Обзор

Проект использует гибридный подход к обработке ошибок:

- **Кастомные классы ошибок** — типизированные ошибки с кодами
- **ActionResult** — стандартный формат ответа для Server Actions
- **Обёртка `action()`** — автоматическое логирование и обработка

## Структура

```
src/lib/errors/
├── index.ts        # Публичный API
├── errors.ts       # Классы ошибок
├── result.ts       # Тип ActionResult
├── prisma.ts       # Обработка Prisma ошибок
└── wrapper.ts      # Обёртка для server actions
```

## Использование

### В Server Actions

```typescript
import {
  action,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

// Оборачиваем логику в action()
export async function updatePost(
  id: number,
  data: UpdateData,
): Promise<ActionResult<Post>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError(); // Автоматически залогируется
    }

    // Валидация
    if (!data.title?.trim()) {
      throw new ValidationError("Заголовок обязателен", {
        title: "Обязательное поле",
      });
    }

    // Проверка существования
    const post = await prisma.post.findFirst({
      where: { id, authorId: parseInt(session.user.id) },
    });
    if (!post) {
      throw new NotFoundError("Пост", id);
    }

    // Обновление
    return prisma.post.update({ where: { id }, data: { title: data.title } });
  });
}
```

### На клиенте

```typescript
const result = await updatePost(1, { title: "Новый заголовок" });

if (result.success) {
  console.log("Пост обновлён:", result.data);
} else {
  console.log("Ошибка:", result.error.code, result.error.message);

  // Можно показать детали валидации
  if (result.error.code === "VALIDATION" && result.error.details?.fields) {
    // Показать ошибки по полям
  }
}
```

## Типы ошибок

| Класс               | Код            | Когда использовать               |
| ------------------- | -------------- | -------------------------------- |
| `ValidationError`   | `VALIDATION`   | Некорректные входные данные      |
| `UnauthorizedError` | `UNAUTHORIZED` | Пользователь не аутентифицирован |
| `ForbiddenError`    | `FORBIDDEN`    | Нет прав на действие             |
| `NotFoundError`     | `NOT_FOUND`    | Ресурс не найден                 |
| `ConflictError`     | `CONFLICT`     | Нарушение уникальности           |
| `DatabaseError`     | `DATABASE`     | Ошибка базы данных               |

## Автоматическая обработка Prisma

Ошибки Prisma автоматически преобразуются:

| Код Prisma | Код ошибки  | Сообщение                             |
| ---------- | ----------- | ------------------------------------- |
| P2002      | `CONFLICT`  | Запись с таким {field} уже существует |
| P2025      | `NOT_FOUND` | Запись не найдена                     |
| P2003      | `DATABASE`  | Нарушение связи между записями        |

## Логирование

Все ошибки автоматически логируются через Winston:

- `ValidationError`, `UnauthorizedError` → `logger.warn()`
- Остальные ошибки → `logger.error()` с stack trace

## Утилиты

### Проверка типа ошибки

```typescript
import { isUniqueConstraintError, isNotFoundError } from "@/lib/errors";

try {
  await prisma.user.create({ data: { email } });
} catch (error) {
  if (isUniqueConstraintError(error, "email")) {
    // Обработка дубликата email
  }
}
```

### Обёртки

```typescript
// Для действий без возвращаемого значения
export const deletePost = actionVoid(async (id: number) => {
  await prisma.post.delete({ where: { id } });
});

// С типизированными аргументами
export const updatePost = withArgs<{ id: number; title: string }>(
  async ({ id, title }) => {
    return prisma.post.update({ where: { id }, data: { title } });
  },
);
```

## Миграция с существующего кода

### До

```typescript
export async function createPost() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')  // Не типизировано
  }

  try {
    const post = await prisma.post.create({...})
    return post
  } catch (error) {
    console.error('Error:', error)  // console.error вместо logger
    throw new Error('Failed to create post')
  }
}
```

### После

```typescript
export async function createPost(): Promise<ActionResult<Post>> {
  return action(async () => {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      throw new UnauthorizedError()  // Типизировано, автологирование
    }

    return prisma.post.create({...})  // Ошибки Prisma обрабатываются автоматически
  })
}
```
