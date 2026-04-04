# Сиды для разработки

Для заполнения базы тестовыми данными:

```bash
npm run db:seed
```

Для сброса базы и заполнения сидами:

```bash
npm run db:reset
```

## Добавление новых данных в сид

Seed-данные хранятся в отдельных JSON-файлах в директории `prisma/seed-data/`:

```
prisma/seed-data/
├── types.ts    # TypeScript типы
├── users.json  # Пользователи
└── posts.json  # Посты блога
```

### Чтобы добавить нового пользователя:

1. Откройте [`prisma/seed-data/users.json`](prisma/seed-data/users.json)
2. Добавьте новый объект в массив:

```json
{
  "id": 8,
  "email": "new@example.com",
  "name": "New User",
  "password": "password123",
  "status": "ACTIVE"
}
```

### Добавление заблокированного пользователя:

```json
{
  "id": 9,
  "email": "banned@example.com",
  "name": "Banned User",
  "password": "banned123",
  "status": "BANNED",
  "banReason": "Нарушение правил",
  "bannedAt": "2026-01-01T00:00:00.000Z",
  "bannedBy": 2
}
```

### Добавление ограниченного пользователя:

```json
{
  "id": 10,
  "email": "restricted@example.com",
  "name": "Restricted User",
  "password": "restricted123",
  "status": "RESTRICTED",
  "restrictedReason": "Нарушение правил",
  "restrictedAt": "2026-01-01T00:00:00.000Z",
  "restrictedBy": 2
}
```

**Доступные поля статуса:**

| Поле             | Тип       | Описание                                     |
| ---------------- | --------- | -------------------------------------------- |
| status           | String    | Статус: ACTIVE, RESTRICTED, BANNED           |
| banReason        | String?   | Причина блокировки (для BANNED)              |
| bannedAt         | DateTime? | Дата блокировки (для BANNED)                 |
| bannedBy         | Int?      | ID модератора, заблокировавшего пользователя |
| restrictedReason | String?   | Причина ограничения (для RESTRICTED)         |
| restrictedAt     | DateTime? | Дата ограничения (для RESTRICTED)            |
| restrictedBy     | Int?      | ID модератора, ограничившего пользователя    |

### Чтобы добавить новый пост:

1. Откройте [`prisma/seed-data/posts.json`](prisma/seed-data/posts.json)
2. Добавьте новый объект, указав `authorId` существующего пользователя:

```json
{
  "title": "Заголовок поста",
  "content": "# Markdown контент\n\nТекст поста...",
  "published": true,
  "authorId": "user_admin"
}
```

### Чтобы добавить новый тип данных:

1. Добавьте интерфейс в [`prisma/seed-data/types.ts`](prisma/seed-data/types.ts):

```typescript
export interface SeedCategory {
  id: string;
  name: string;
  slug: string;
}
```

2. Создайте JSON-файл `prisma/seed-data/categories.json`

3. Добавьте загрузку в [`prisma/seed.ts`](prisma/seed.ts):

```typescript
// В функции loadSeedData()
const categories: SeedCategory[] = JSON.parse(
  fs.readFileSync(path.join(seedDataDir, "categories.json"), "utf-8"),
);

// В функции main()
for (const category of categories) {
  await prisma.category.create({ data: category });
}
```
