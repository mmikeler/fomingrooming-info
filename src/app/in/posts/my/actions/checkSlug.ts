"use server";

import { prisma } from "@/lib/prisma";
import { action } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { slugify } from "@/lib/slug";

interface CheckSlugResult {
  isUnique: boolean;
  suggestedSlug: string;
}

/**
 * Проверка уникальности slug
 */
export async function checkSlugUniqueness(
  slug: string,
  excludeId?: number,
): Promise<ActionResult<CheckSlugResult>> {
  return action(async () => {
    const existingPost = await prisma.post.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    if (!existingPost) {
      return { isUnique: true, suggestedSlug: slug };
    }

    // Генерируем уникальный slug с суффиксом
    let counter = 2;
    let suggestedSlug = `${slug}-${counter}`;

    while (counter < 10000) {
      const existing = await prisma.post.findFirst({
        where: {
          slug: suggestedSlug,
          ...(excludeId && { id: { not: excludeId } }),
        },
        select: { id: true },
      });

      if (!existing) {
        return { isUnique: false, suggestedSlug };
      }

      counter++;
      suggestedSlug = `${slug}-${counter}`;
    }

    // Fallback с timestamp
    return {
      isUnique: false,
      suggestedSlug: `${slug}-${Date.now()}`,
    };
  });
}

/**
 * Генерация slug из заголовка с проверкой уникальности
 */
export async function generateUniqueSlug(
  title: string,
  excludeId?: number,
): Promise<ActionResult<string>> {
  return action(async () => {
    const baseSlug = slugify(title);

    const result = await checkSlugUniqueness(baseSlug, excludeId);
    if (!result.success) {
      throw new Error("Ошибка при проверке уникальности slug");
    }

    return result.data.suggestedSlug;
  });
}
