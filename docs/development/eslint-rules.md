# Правила ESLint

ESLint конфигурация находится в [`eslint.config.mjs`](../../eslint.config.mjs) и использует flat config формат ESLint 9.

## Структура конфигурации

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { configs } from "eslint-config-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...configs["flat/recommended"], // Next.js recommended rules

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Кастомные правила
    },
  },
];
```

## Включённые плагины

### Next.js конфигурация

Наследуем от `eslint-config-next`:

- `core-web-vitals` — правила для производительности и лучших практик
- `typescript` — правила для TypeScript
- `react-hooks` — правила для React hooks

## Кастомные правила

Проект может добавлять собственные правила в конфигурацию:

```javascript
{
  rules: {
    "no-console": "warn",  // Предупреждение о console.log
    "no-unused-vars": "error", // Ошибка для неиспользуемых переменных
  }
}
```

## Игнорируемые файлы

Автоматически игнорируются:

- `.next/` — сгенерированные файлы Next.js
- `out/` — статические сборки
- `build/` — production сборки
- `node_modules/` — зависимости
- `coverage/` — результаты тестов

Дополнительные исключения можно добавить в `.eslintignore`.

## Автоматическое исправление

Многие проблемы ESLint могут быть автоматически исправлены:

```bash
# Исправление всех auto-fixable ошибок
npm run lint -- --fix

# Или конкретного файла
npx eslint src/app/page.tsx --fix
```

## Интеграция с VS Code

1. Установите расширение **ESLint**
2. В настройках добавьте:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

Теперь ESLint будет автоматически исправлять ошибки при сохранении файла.

## Common Rules

### TypeScript-specific

- `@typescript-eslint/no-unused-vars` — проверка неиспользуемых переменных
- `@typescript-eslint/explicit-module-boundary-types` — требует явных типов возвращаемого значения
- `@typescript-eslint/no-misused-promises` — проверка правильного использования Promise

### React-specific

- `react-hooks/exhaustive-deps` — проверка зависимостей useEffect
- `react/no-children-prop` — запрет использования children prop

### Best practices

- `no-console` — запрет console.log (можно настроить как warn)
- `no-debugger` — запрет debugger
- `prefer-const` — требует const для непереприсваиваемых переменных

## Настройка per-file

Для отдельных файлов или директорий можно переопределять правила:

```javascript
{
  files: ["**/*.test.ts", "**/*.spec.ts"],
  rules: {
    "no-unused-vars": "off", // В тестах допустимы неиспользуемые параметры
  }
}
```

## Просмотр ошибок

```bash
# Показать все ошибки
npx eslint .

# Показать только ошибки (без предупреждений)
npx eslint . --quiet

# Показать правило для конкретного сообщения
npx eslint --print-config src/file.ts
```

## Отключение правил

Избегайте отключения правил на уровне файлов. Если необходимо, используйте comment:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

Но только временно и с объяснением в комментарии.
