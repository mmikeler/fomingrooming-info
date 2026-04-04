# Структура тестов

Все E2E-тесты расположены в директории `e2e/` в корне проекта.

## Организация тестов

```
e2e/
├── auth.spec.ts   # Тесты аутентификации (вход, регистрация)
├── posts.spec.ts  # Тесты постов блога (просмотр, создание, защита)
└── events.spec.ts # Тесты мероприятий (просмотр, создание, регистрация)
```

## Парадигма тестирования

Проект следует подходу **User Journey Testing** — тесты моделируют реальные сценарии использования портала:

### Пример сценария:

1. **Регистрация** нового пользователя
2. **Вход** в систему
3. **Создание** поста или регистрация на мероприятие
4. **Просмотр** созданного контента
5. **Редактирование** или удаление
6. **Выход** из системы

## Написание новых тестов

### Базовый template

```typescript
import { test, expect } from "@playwright/test";

test.describe("Название группы тестов", () => {
  test("should [ожидаемое поведение]", async ({ page }) => {
    // Навигация
    await page.goto("/");

    // Действия
    await page.click("[data-testid=login-button]");

    // Ожидания
    await expect(page).toHaveURL("/auth/login");
    await expect(page.locator("h1")).toHaveText("Вход");
  });
});
```

### Использование fixtures

Для повторяющихся действий (логин, создание тестовых данных) используйте fixtures:

```typescript
import { test as base } from "@playwright/test";

const test = base.extend({
  page: async ({ page }, use) => {
    // Setup: логин перед каждым тестом
    await page.goto("/auth/login");
    await page.fill("[name=email]", "test@example.com");
    await page.fill("[name=password]", "password123");
    await page.click("[type=submit]");

    await use(page);
  },
});

test("should access protected page", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).not.toHaveURL("/auth/login");
});
```

## Best Practices

1. **Изолированные тесты** — каждый тест должен быть независимым
2. **Стабильные селекторы** — используйте `data-testid` атрибуты вместо CSS классов
3. **Ясные названия** — `should create post with valid data`, а не `should work`
4. **Page Object Pattern** — для сложных компонентов создавайте классы-обёртки

### Пример с `data-testid`:

```tsx
// В компоненте:
<button data-testid="create-post-button">Создать пост</button>;

// В тесте:
await page.click("[data-testid=create-post-button]");
```

## Запуск отдельных тестов

```bash
# Только auth тесты
npx playwright test e2e/auth.spec.ts

# Только тесты с определённым названием
npx playwright test --grep "should create post"

# По тегу
npx playwright test --grep @smoke
```
