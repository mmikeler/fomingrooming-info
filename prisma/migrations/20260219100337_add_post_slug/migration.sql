/*
  Warnings:

  - Added the required column `slug` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "authorId" INTEGER NOT NULL,
    "moderatedAt" DATETIME,
    "moderatedBy" INTEGER,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Post_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
-- Генерируем slug из id для существующих постов
INSERT INTO "new_Post" ("authorId", "content", "created", "id", "moderatedAt", "moderatedBy", "rejectionReason", "status", "title", "slug") SELECT "authorId", "content", "created", "id", "moderatedAt", "moderatedBy", "rejectionReason", "status", "title", 'post-' || id FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_slug_idx" ON "Post"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
