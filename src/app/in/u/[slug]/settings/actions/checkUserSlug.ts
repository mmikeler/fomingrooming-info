"use server";

import { prisma } from "@/lib/prisma";
import { action } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { slugify, validateSlug } from "@/lib/slug";

interface CheckSlugResult {
  isUnique: boolean;
  suggestedSlug: string;
  isValid: boolean;
}

/**
 * Проверка уникальности slug пользователя
 */
export async function checkUserSlug(
  slug: string,
  excludeUserId?: number,
): Promise<ActionResult<CheckSlugResult>> {
  return action(async () => {
    // Валидация формата slug
    const isValid = validateSlug(slug);
    if (!isValid) {
      return { isUnique: false, suggestedSlug: slug, isValid: false };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        slug,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      select: { id: true },
    });

    if (!existingUser) {
      return { isUnique: true, suggestedSlug: slug, isValid: true };
    }

    // Генерируем уникальный slug с суффиксом
    let counter = 2;
    let suggestedSlug = `${slug}-${counter}`;

    while (counter < 10000) {
      const existing = await prisma.user.findFirst({
        where: {
          slug: suggestedSlug,
          ...(excludeUserId && { id: { not: excludeUserId } }),
        },
        select: { id: true },
      });

      if (!existing) {
        return { isUnique: false, suggestedSlug, isValid: true };
      }

      counter++;
      suggestedSlug = `${slug}-${counter}`;
    }

    // Fallback с timestamp
    return {
      isUnique: false,
      suggestedSlug: `${slug}-${Date.now()}`,
      isValid: true,
    };
  });
}

/**
 * Генерация slug из имени с проверкой уникальности
 */
export async function generateUniqueUserSlug(
  name: string,
  excludeUserId?: number,
): Promise<ActionResult<string>> {
  return action(async () => {
    const baseSlug = slugify(name);

    const result = await checkUserSlug(baseSlug, excludeUserId);
    if (!result.success) {
      throw new Error("Ошибка при проверке уникальности slug");
    }

    return result.data.suggestedSlug;
  });
}
