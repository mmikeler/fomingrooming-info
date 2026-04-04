# Рекомендации для редактора

## VS Code (рекомендуется)

### Расширения

Установите следующие расширения для лучшего опыта разработки:

| Расширение                    | Назначение                                 |
| ----------------------------- | ------------------------------------------ |
| **ESLint**                    | Интеграция с ESLint, подсветка ошибок      |
| **Prettier**                  | Автоформатирование кода                    |
| **Tailwind CSS IntelliSense** | Автодополнение Tailwind классов            |
| **Prisma**                    | Подсветка и автодополнение для Prisma      |
| **TypeScript Importer**       | Автоматический импорт типов                |
| **GitLens**                   | Продвинутый Git                            |
| **Auto Rename Tag**           | Автоматическое переименование парных тегов |

### Настройки

Добавьте в `settings.json` (Ctrl+Shift+P → "Preferences: Open Settings (JSON)"):

```json
{
  // Форматирование при сохранении
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],

  // Типограф
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,

  // Табуляция
  "editor.tabSize": 2,
  "editor.insertSpaces": true,

  // Убирает лишние пробелы
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,

  // Tailwind
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### snippets (опционально)

Создайте custom snippets для часто используемых паттернов:

```json
{
  "Server Action": {
    "prefix": "action",
    "body": [
      "\"use server\";",
      "",
      "import { action } from \"@/lib/errors\";",
      "",
      "export async function ${1:name}(${2:params}): Promise<ActionResult<$3>> {",
      "  return action(async () => {",
      "    $0",
      "  });",
      "}"
    ],
    "description": "Create Server Action"
  }
}
```

## WebStorm/IntelliJ IDEA

### Плагины

Установите:

- **ESLint** — встроен
- **Prettier** — встроен
- **Tailwind CSS** — из marketplace
- **Prisma** — из marketplace

### Настройки

```text
Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
✓ Automatic ESLint configuration
√ Use global ESLint
```

```text
Settings → Editor → Code Style → TypeScript
Tab size: 2
Indent: 2
```

## Sublime Text

### Package Control

Установите:

- **ESLint** (SublimeLinter-eslint)
- **Prettier** (JsPrettier)
- **TypeScript** (отовленный пакет)

## Atom

### Установка

```bash
apm install linter-eslint prettier-atom language-typescript
```

## Общие рекомендации

### 1. Включите форматирование при сохранении

Это гарантирует консистентность без ручных действий.

### 2. Следуйте конфигурации проекта

Не переопределяйте настройки编辑器 локально — используйте конфиги из репозитория:

- `.eslintrc.cjs` / `eslint.config.mjs`
- `.prettierrc` / `.prettierrc.json`
- `tsconfig.json`

### 3. Используйте Recommended Extensions

VS Code покажет рекомендации при открытии проекта (`.vscode/extensions.json`). Установите их.

### 4. Проверяйте настройки Husky

Убедитесь, что pre-commit hooks работают:

```bash
# Проверить hooks
cat .git/hooks/pre-commit

# Если нет, переустановить
npm run prepare
```

## Troubleshooting

### ESLint не работает

1. Убедитесь, что расширение ESLint установлено
2. Проверьте, что в项目 есть `eslint.config.mjs` или `.eslintrc.*`
3. Перезапустите VS Code

### Prettier не форматирует

1. Установите Prettier расширение
2. Установите `"editor.defaultFormatter": "esbenp.prettier-vscode"`
3. Убедитесь, что нет конфликта с другим форматтером

### TypeScript ошибки в VS Code, но компиляция проходит

Проверьте версию TypeScript:

```bash
npx tsc --version
```

VS Code должен использовать workspace версию TypeScript (в `node_modules`). Нажмите на версию в статус-баре (左下) → "Use Workspace Version".
