# Структура проекта

```
.
├── app/                      # App Router — страницы и layouts
│   ├── actions/              # Глобальные Server Actions (upload-image)
│   ├── admin/                # Админ-панель
│   │   ├── actions/          # Server Actions для админки
│   │   ├── components/       # Компоненты админ-панели
│   │   ├── moderation/       # Модерация контента
│   │   │   ├── actions/      # Server Actions модерации
│   │   │   └── components/   # Компоненты модерации
│   │   ├── reklama/          # Управление рекламой
│   │   └── users/            # Управление пользователями
│   ├── api/                  # API Routes (NextAuth route: [...nextauth])
│   ├── auth/                 # Страницы аутентификации
│   │   ├── forgot-password/  # Запрос сброса пароля
│   │   ├── resend-verification/  # Повторная отправка verification
│   │   ├── reset-password/   # Сброс пароля
│   │   ├── signin/           # Вход (включая VK OAuth)
│   │   ├── signup/           # Регистрация
│   │   ├── verify-email/     # Подтверждение email
│   │   └── [...nextauth]/    # OAuth через NextAuth
│   ├── components/           # Общие компоненты (共用)
│   │   ├── ads/              # Компоненты рекламы
│   │   ├── events/           # Компоненты мероприятий
│   │   ├── lenta/            # Компоненты ленты
│   │   ├── likes/            # Компоненты лайков
│   │   ├── post/             # Компоненты постов
│   │   ├── recommendations/  # Рекомендации
│   │   ├── ui/               # Базовые UI компоненты (Button, Card и т.д.)
│   │   └── views/            # Компоненты просмотров
│   ├── feed/                 # Лента новостей (главная)
│   ├── in/                   # Личный кабинет
│   │   ├── events/           # Управление мероприятиями пользователя
│   │   ├── favorites/        # Избранное
│   │   ├── files/            # Галерея файлов пользователя
│   │   ├── lenta/            # Настраиваемая новостная лента
│   │   ├── p/                # Публичные страницы (about, help, reklama)
│   │   ├── posts/            # Управление постами пользователя
│   │   └── u/               # Публичные профили пользователей
│   │       └── [slug]/      # Динамический маршрут по slug
│   ├── p/                    # Публичные страницы
│   │   ├── about.md
│   │   ├── help.md
│   │   └── reklama.md
│   ├── layout.tsx           # Корневой layout
│   ├── page.tsx             # Главная страница
│   └── globals.css          # Глобальные стили
├── components/              # Глобальные компоненты (не в app/)
│   └── ...                  # Компоненты, используемые в server context
├── e2e/                     # E2E тесты Playwright
│   ├── auth.spec.ts
│   ├── posts.spec.ts
│   └── events.spec.ts
├── lib/                     # Утилиты и библиотеки
│   ├── auth.ts              # Конфигурация NextAuth
│   ├── errors/              # Классы ошибок и обёртки
│   │   ├── index.ts
│   │   ├── errors.ts
│   │   ├── result.ts
│   │   ├── prisma.ts
│   │   └── wrapper.ts
│   ├── logger.ts            # Winston логгер
│   ├── permissions.ts       # Проверка прав доступа
│   ├── prisma.ts            # Prisma клиент
│   └── rate-limit/          # Ограничение частоты запросов
│   ├── markdown.ts          # Markdown-процессор
│   ├── metadata.ts          # генерация мета-данных
│   ├── notifications.ts     # система уведомлений
│   ├── password-generator.ts # генератор паролей
│   ├── postCategoryLabels.ts # метки категорий постов
│   ├── restricted-paths.ts  # список закрытых путей
│   ├── slug.ts              # генерация slug
│   └── upload/              # работа с файлами и изображениями
│       ├── file-storage.ts
│       ├── image-processor.ts
│       └── image-validator.ts
├── prisma/                  # Миграции БД
│   └── schema.prisma        # Схема Prisma
├── scripts/
│   └── seed-data/           # JSON-данные для сидов
│       ├── seed.ts
│       ├── types.ts
│       ├── users.json
│       ├── posts.json
│       ├── events.json
│       ├── event-registrations.json
│       ├── notifications.json
│       ├── moderation-logs.json
│       └── adv.json
├── public/                  # Статические ассеты
│   ├── images/
│   └── fonts/
├── src/                     # Исходный код (альтернативная организация)
│   └── ...                  # Можно реорганизовать позже
├── types/                   # Global TypeScript типы
│   └── index.ts
├── .env.example             # Пример переменных окружения
├── Dockerfile               # Docker конфигурация
├── eslint.config.mjs        # ESLint конфигурация
├── middleware.ts            # Next.js middleware (если есть)
├── next.config.ts           # Next.js конфигурация
├── package.json             # Зависимости и скрипты
├── playwright.config.ts     # Playwright конфигурация
├── tailwind.config.ts       # Tailwind конфигурация
├── tsconfig.json            # TypeScript конфигурация
└── README.md                # Основной README
```

## Принципы организации

### App Router (Next.js 13+)

- **app/** — корневая директория для App Router
- Каждая папка = маршрут (route segment)
- `page.tsx` — основная страница сегмента
- `layout.tsx` — layout для сегмента
- `loading.tsx` / `error.tsx` / `not-found.tsx` — специальные UI

### Server Components по умолчанию

Компоненты в `app/` по умолчанию Server Components. Для Client Components добавьте `"use client"` в начале файла.

### Server Actions

Размещаются в папках `actions/` внутри маршрутов:

```
app/
├── admin/
│   └── actions/
│       └── manageUserStatus.ts
├── in/
│   └── posts/
│       └── actions/
│           └── createPost.ts
```

### Общие компоненты

Компоненты, используемые в нескольких местах:

- **app/components/** — компоненты, специфичные для app router (могут быть server)
- **components/** (корень) — глобальные компоненты, часто client

### Утилиты и библиотеки

Все серверные утилиты в `lib/`:

- `lib/prisma.ts` — Prisma клиент (server)
- `lib/auth.ts` — NextAuth конфиг
- `lib/logger.ts` — Winston logger
- `lib/errors/` — обработка ошибок

### База данных

- `prisma/schema.prisma` — схема БД
- `scripts/seed-data/seed.ts` — скрипт для заполнения тестовыми данными
- `scripts/seed-data/` — JSON файлы с данными

## Директории и их назначение

| Директория        | Назначение                              | Server/Client |
| ----------------- | --------------------------------------- | ------------- |
| app/              | Страницы, layouts, server actions       | mixed         |
| app/components/   | Общие компоненты для App Router         | mixed         |
| components/       | Глобальные компоненты (вне app/)        | mostly client |
| lib/              | Серверные утилиты и конфиги             | server        |
| e2e/              | E2E тесты                               | n/a           |
| prisma/           | Схема БД и миграции                     | n/a           |
| scripts/seed-data | JSON-данные для сидов                   | n/a           |
| public/           | Статические файлы (изображения, шрифты) | n/a           |
| types/            | Глобальные TypeScript типы              | n/a           |

## Server vs Client Components

### Server Components (по умолчанию в app/)

- **Доступ к БД**: напрямую через Prisma
- **Безопасность**: секреты остаются на сервере
- **Производительность**: меньший bundle размер

### Client Components (с `"use client"`)

- **Интерактивность**: хуки (useState, useEffect),event handlers
- **Браузерные API**: window, document, localStorage
- **Кастомные хуки**

### Принцип: чем больше server, тем лучше

Переносите логику в server components, используйте client components только для:

- Интерактивных элементов (кнопки, формы)
- Состояний клиента (textarea input, UI state)
- Кастомных хуков

## Миграция существующего кода

Если проект был на Pages Router, постепенно мигрируйте на App Router:

1. Создайте `app/` директорию
2. Перенесите страницы в `app/` как `page.tsx`
3. Создайте общий `layout.tsx`
4. Переписывайте компоненты на server-first подход
5. Постепенно добавляйте client components

## Дополнительные ресурсы

- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-and-client-components)
- [Project Structure](https://nextjs.org/docs/app/building-your-application/routing/colocation)
