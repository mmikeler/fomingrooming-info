# Требования для тестов

## Обязательные условия

Перед запуском E2E-тестов необходимо выполнить следующие шаги:

### 1. Запуск сервера разработки

Тесты взаимодействуют с живым приложением, поэтому сервер должен быть запущен:

```bash
# В одном терминале
npm run dev
```

Сервер должен быть доступен по адресу `http://localhost:3000` (или другому, указанному в `playwright.config.ts`).

### 2. Заполнение базы данных сидами

Тесты полагаются на наличие определённых пользователей и контента в базе:

```bash
npm run db:seed
```

Если база уже содержит данные, но нужно сбросить её:

```bash
npm run db:reset
```

### 3. Наличие тестовых пользователей

Тесты используют предустановленных пользователей из [`../database/test-users.md`](../database/test-users.md):

- `user@e.com` / `user123` — обычный пользователь
- `author@e.com` / `author123` — автор с правами публикации
- `moderator@e.com` / `moderator123` — модератор
- `admin@e.com` / `admin123` — администратор
- `superadmin@e.com` / `superadmin123` — суперадминистратор
- `restricted@e.com` / `restricted123` — ограниченный пользователь
- `banned@e.com` / `banned123` — заблокированный пользователь

## Проверка готовности

Перед запуском тестов выполните проверку:

```bash
# 1. Проверить, что сервер запущен
curl http://localhost:3000

# 2. Проверить, что база содержит данные
npx prisma studio

# 3. Проверить наличие тестовых пользователей
npx prisma db seed --dry-run
```

## Типичные проблемы

### Проблема: `ECONNREFUSED localhost:3000`

**Решение**: Убедитесь, что сервер разработки запущен (`npm run dev`).

### Проблема: `Authentication failed`

**Решение**: Проверьте, что тестовые пользователи существуют. Перезапустите сиды: `npm run db:reset`.

### Проблема: `Element not found`

**Решение**: Установите `data-testid` атрибуты на ключевые элементы интерфейса. Тесты должны использовать стабильные селекторы.

### Проблема: `Timeout`

**Решение**: Увеличьте таймаут в `playwright.config.ts` или оптимизируйте производительность приложения.

## CI/CD

В CI окружении (GitHub Actions, GitLab CI) нужно:

1. Установить зависимости: `npm ci`
2. Собрать проект: `npm run build`
3. Запустить сервер: `npm start`
4. Дождаться готовности: `npx playwright install-deps && npx playwright install`
5. Запустить тесты: `npx playwright test`

Пример workflow для GitHub Actions:

```yaml
- name: Start server
  run: npm start &

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run tests
  run: npx playwright test
```
