-- AlterTable: Add slug column as nullable first
ALTER TABLE "User" ADD COLUMN "slug" TEXT;

-- Update existing users with unique slugs based on their ID
UPDATE "User" SET "slug" = 'user-' || CAST("id" AS TEXT) WHERE "slug" IS NULL OR "slug" = '';

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex (for lookups)
CREATE INDEX "User_slug_idx" ON "User"("slug");
