# Конфигурация TypeScript

Проект использует строгий режим TypeScript для обеспечения типобезопасности.

## Файл конфигурации

Основная конфигурация находится в [`tsconfig.json`](../../tsconfig.json) в корне проекта.

## Настройки

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Ключевые параметры

### `strict: true`

Включает все строгие проверки типов:

- `noImplicitAny` — запрет неявного типа `any`
- `strictNullChecks` — строгая проверка `null` и `undefined`
- `strictFunctionTypes` — строгая проверка типов функций
- `strictBindCallApply` — строгая проверка bind/call/apply
- `strictPropertyInitialization` — проверка инициализации свойств классов
- `noImplicitThis` — запрет неявного `this`
- `alwaysStrict` — всегда строгий режим

### `noEmit: true`

TypeScript только проверяет типы, но не генерирует JavaScript файлы. Генерация управляется Next.js/ transpiler.

### `paths` — Алиасы

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Позволяет использовать импорт через `@`:

```typescript
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
```

## Next.js расширение

Плагин `next` обеспечивает правильную работу TypeScript с Next.js App Router, включая:

- Поддержка `.tsx` и `.tsx` файлов
- Проверка `next/dynamic` импортов
- Типы для Server Components и Client Components

## Типы Next.js

Типы для Next.js автоматически генерируются в `.next/types/`. Они добавляются в `include` для инкрементальной проверки.

## Расширенная конфигурация (опционально)

Для монорепозиториев или сложных проектов можно использовать [`tsconfig.base.json`](../../tsconfig.base.json) и расширять его в каждой папке.

### Пример иерархии:

```
tsconfig.base.json    # Базовые настройки
tsconfig.json         # Расширение базы + project-specific
apps/web/tsconfig.json # Для конкретного приложения
packages/ui/tsconfig.json # Для компонентной библиотеки
```

## Проверка

```bash
# Локальная проверка
npx tsc --noEmit

# Или через npm script
npm run typecheck
```

## Проблемы и решения

### Ошибка: "Cannot find module" или "Cannot find name"

Убедитесь, что файл включён в `include` или не исключён в `exclude`.

### Ошибка: "Type '{}' is missing the following properties"

Проверьте, что интерфейс соответствует данным. Используйте `as` только когда уверены в типе.

### Медленная проверка

Используйте инкрементальную проверку: `tsc --noEmit --incremental` (включено по умолчанию в Next.js).
