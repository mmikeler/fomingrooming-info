# Правила отображения даты

Проект использует стандартный JavaScript API [`Date.toLocaleDateString()`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString) для форматирования дат. Локаль по умолчанию — `"ru-RU"`.

## Принципы форматирования

### 1. Относительный формат (для уведомлений)

Для недавних событий используется относительный формат времени:

| Условие    | Формат         | Пример        |
| ---------- | -------------- | ------------- |
| < 1 минуты | "Только что"   | Только что    |
| < 60 минут | "X мин. назад" | 15 мин. назад |
| < 24 часов | "X ч. назад"   | 3 ч. назад    |
| < 7 дней   | "X дн. назад"  | 2 дн. назад   |
| ≥ 7 дней   | Полная дата    | 15.02.2026    |

**Реализация:** [`src/app/components/notification-bell.tsx`](../../src/app/components/notification-bell.tsx:78)

```typescript
const formatDate = (date: Date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  return d.toLocaleDateString("ru-RU");
};
```

### 2. Полная дата с временем (для модерации)

Используется для отображения даты создания поста в очереди модерации:

```typescript
new Date(date).toLocaleDateString("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
// Пример: "19 февраля 2026 г., 15:30"
```

**Использование:** [`src/app/moderation/components/ModerationQueue.tsx`](../../src/app/moderation/components/ModerationQueue.tsx:69)

### 3. Краткая дата (для таблиц)

Используется в таблицах администрирования:

```typescript
new Date(date).toLocaleDateString("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
// Пример: "19 февр. 2026 г."
```

**Использование:** [`src/app/admin/components/UsersTable.tsx`](../../src/app/admin/components/UsersTable.tsx:140)

### 4. Простая дата (по умолчанию)

Используется для отображения дат в таблицах постов и виджетах блога:

```typescript
new Date(date).toLocaleDateString();
// Пример: "19.02.2026"
```

**Использование:**

- [`src/app/profile/posts/components/PostsTable.tsx`](../../src/app/profile/posts/components/PostsTable.tsx:172)
- [`src/app/components/blog-widget.tsx`](../../src/app/components/blog-widget.tsx:54)
- [`src/app/blog/[slug]/page.tsx`](../../src/app/blog/[slug]/page.tsx:61)

## Рекомендации

1. **Всегда используйте локаль `"ru-RU"`** для явного указания формата.
2. **Для новых компонентов** выбирайте формат в зависимости от контекста:
   - Уведомления → относительный формат
   - Таблицы → краткая или простая дата
   - Детальные страницы → полная дата с временем
3. **Не используйте сторонние библиотеки** (date-fns, dayjs, moment) — проект использует нативный JavaScript API.

### Пример утилиты форматирования

Создайте универсальную функцию для форматирования:

```typescript
// src/lib/date-format.ts
export function formatDateRelative(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  return d.toLocaleDateString("ru-RU");
}

export function formatDateFull(date: Date | string): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateSimple(date: Date | string): string {
  return new Date(date).toLocaleDateString("ru-RU");
}
```

### Использование утилиты

```typescript
import { formatDateRelative, formatDateFull } from "@/lib/date-format";

function NotificationItem({ createdAt }: { createdAt: Date }) {
  return (
    <div>
      <span>{formatDateRelative(createdAt)}</span>
    </div>
  );
}

function PostMeta({ publishedAt }: { publishedAt: Date }) {
  return (
    <div>
      <span>Опубликовано: {formatDateFull(publishedAt)}</span>
    </div>
  );
}
```

## ISO форматы для API

При передаче дат через API используйте ISO 8601:

```typescript
const isoDate = new Date().toISOString(); // "2026-02-19T15:30:00.000Z"
```

## Временные зоны

Все даты хранятся в UTC в базе данных. При отображении используйте локаль пользователя (ru-RU). Не конвертируйте в другие временные зоны вручную — `toLocaleDateString()` само-adjusted.

## Дополнительные материалы

- [MDN: Date.toLocaleDateString()](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Требования к локали ru-RU](https://unicode-org.github.io/cldr-staging/charts/37/supplemental/territory_information.html)
