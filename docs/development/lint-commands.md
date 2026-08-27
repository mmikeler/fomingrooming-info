# Команды линтинга

## Проверка кода

```bash
# Основная команда линтинга
npm run lint

# С исправлением auto-fixable ошибок
npm run lint -- --fix
```

## Форматирование

```bash
# Форматирование всех файлов
npx prettier --write .

# Проверка форматирования без изменений
npx prettier --check .
```

## ESLint конфигурация

Конфигурация находится в [`eslint.config.mjs`](../../eslint.config.mjs) в корне проекта.

### Плагины и настройки

- `eslint-config-next/core-web-vitals` — правила Next.js и performance
- `eslint-config-next/typescript` — правила TypeScript
- Игнорируемые директории: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Структура конфигурации

```javascript
export default [
  // Наследуем правила от Next.js
  ...configs["flat/recommended"],

  // Кастомные правила
  {
    rules: {
      // Пример кастомного правила
      "no-console": "warn",
    },
  },
];
```

## TypeScript проверка

```bash
# Проверка типов
npx tsc --noEmit

# Или через npm script (если настроен)
npm run typecheck
```

## pre-commit hooks

Применяются автоматически через Husky + lint-staged:

1. **ESLint** — проверка staged TypeScript/JavaScript файлов
2. **Prettier** — форматирование staged файлов
3. **TypeScript** — проверка типов (опционально)

### Настройка в `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,scss}": ["prettier --write"]
  }
}
```

## CI/CD

В CI-пайплайне рекомендуется:

```bash
# Install
npm ci

# Lint
npm run lint

# Type check
npm run typecheck

# Tests
npm run test:e2e
```

## Подавление предупреждений

Избегайте подавления предупреждений ESLint. Если необходимо, используйте comment:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unused = "variable";
```

Но только в обоснованных случаях (например, в тестах или при работе с API которые требуют определённых имён).
