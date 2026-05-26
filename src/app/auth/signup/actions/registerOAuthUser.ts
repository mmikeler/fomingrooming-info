"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/slug";
import { action, ConflictError, isUniqueConstraintError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { hash } from "bcryptjs";

interface RegisterOAuthData {
  name: string;
  email: string;
}

interface RegisteredUser {
  id: number;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
}

/**
 * Регистрация пользователя через OAuth провайдер (Яндекс)
 * Создаёт пользователя с уникальным slug на основе email
 */
export async function registerOAuthUser(
  data: RegisterOAuthData,
): Promise<ActionResult<RegisteredUser>> {
  const { name, email } = data;

  // Валидация
  if (!name || !email) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "Имя и email обязательны",
      },
    };
  }

  // Проверка, не зарегистрирован ли уже пользователь
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: {
        code: "CONFLICT",
        message: "Пользователь с таким email уже зарегистрирован",
      },
    };
  }

  // Генерация уникального slug из email (часть до @)
  const emailPrefix = email.split("@")[0];
  const baseSlug = slugify(emailPrefix);
  const finalBaseSlug = baseSlug.length >= 3 ? baseSlug : `user-${baseSlug}`;

  // Проверка уникальности slug
  let slug = finalBaseSlug;
  let counter = 1;
  const maxAttempts = 10000;
  while (counter <= maxAttempts) {
    const existing = await prisma.user.findFirst({ where: { slug } });
    if (!existing) break;
    slug = `${finalBaseSlug}-${counter}`;
    counter++;
  }

  if (counter > maxAttempts) {
    slug = `${finalBaseSlug}-${Date.now()}`;
  }

  // Создание пользователя с обработкой ошибок
  return action(async () => {
    let user;
    let attempts = 0;
    const maxCreateAttempts = 5;
    const password = await hash(new Date().getTime().toString(), 10);

    while (attempts < maxCreateAttempts) {
      try {
        user = await prisma.user.create({
          data: {
            name,
            email,
            slug,
            password,
            emailVerified: new Date(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
          },
        });
        break;
      } catch (error) {
        if (isUniqueConstraintError(error, "slug")) {
          attempts++;
          slug = `${finalBaseSlug}-${Date.now()}-${attempts}`;
          logger.warn(
            "Slug collision during OAuth registration, retrying with new slug",
            {
              originalSlug: finalBaseSlug,
              newSlug: slug,
              attempt: attempts,
            },
          );
          continue;
        }
        if (isUniqueConstraintError(error, "email")) {
          throw new ConflictError("Пользователь с таким email уже существует");
        }
        throw error;
      }
    }

    if (!user) {
      throw new Error(
        "Не удалось создать пользователя после нескольких попыток",
      );
    }

    logger.info("New user registered via OAuth (Yandex)", {
      userId: user.id,
      email: user.email,
      slug,
    });

    return user;
  });
}
