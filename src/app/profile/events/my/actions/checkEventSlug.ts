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
 * Проверка уникальности slug для мероприятия
 */
export async function checkEventSlugUniqueness(
  slug: string,
  excludeId?: number,
): Promise<ActionResult<CheckSlugResult>> {
  return action(async () => {
    const existingEvent = await prisma.event.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    if (!existingEvent) {
      return { isUnique: true, suggestedSlug: slug };
    }

    // Генерируем уникальный slug с суффиксом
    let counter = 2;
    let suggestedSlug = `${slug}-${counter}`;

    while (counter < 10000) {
      const existing = await prisma.event.findFirst({
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
 * Генерация slug из названия мероприятия с проверкой уникальности
 */
export async function generateEventUniqueSlug(
  title: string,
  excludeId?: number,
): Promise<ActionResult<string>> {
  return action(async () => {
    const baseSlug = slugify(title);

    const result = await checkEventSlugUniqueness(baseSlug, excludeId);
    if (!result.success) {
      throw new Error("Ошибка при проверке уникальности slug");
    }

    return result.data.suggestedSlug;
  });
}
