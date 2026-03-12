"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/slug";
import {
  action,
  ValidationError,
  ConflictError,
  isUniqueConstraintError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { sendVerificationEmail, generateVerificationToken } from "@/lib/email";
import { checkPublicRateLimit } from "@/lib/rate-limit";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface RegisteredUser {
  id: number;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
}

/**
 * Регистрация нового пользователя с данными
 */
export async function register(
  data: RegisterData,
): Promise<ActionResult<RegisteredUser>> {
  // Применяем rate limiting для защиты от спам-регистраций
  const rateLimit = await checkPublicRateLimit("register");

  if (rateLimit.success === false) {
    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: rateLimit.error.message,
        details: rateLimit.error.details,
      },
    };
  }

  const { name, email, password } = data;

  // Валидация обязательных полей
  const missingFields: Record<string, string> = {};
  if (!name) missingFields.name = "Обязательно";
  if (!email) missingFields.email = "Обязательно";
  if (!password) missingFields.password = "Обязательно";

  if (Object.keys(missingFields).length > 0) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "Все поля обязательны",
        details: { fields: missingFields },
      },
    };
  }

  // Проверка формата email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "Некорректный формат email",
        details: { fields: { email: "Некорректный формат" } },
      },
    };
  }

  // Проверка длины пароля
  if (password.length < 6) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "Пароль должен быть не менее 6 символов",
        details: { fields: { password: "Минимум 6 символов" } },
      },
    };
  }

  // Генерация уникального slug из имени
  const baseSlug = slugify(name);

  // Проверка минимальной длины slug
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

  // Если все попытки исчерпаны, используем slug с timestamp
  if (counter > maxAttempts) {
    slug = `${finalBaseSlug}-${Date.now()}`;
  }

  // Генерация токена верификации
  const verificationToken = generateVerificationToken();
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 12);

  // Создание пользователя с обработкой ошибок
  // Используем цикл для обработки race conditions при создании slug
  return action(async () => {
    let user;
    let attempts = 0;
    const maxCreateAttempts = 5;

    while (attempts < maxCreateAttempts) {
      try {
        user = await prisma.user.create({
          data: {
            name,
            slug,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires,
          },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
          },
        });
        break; // Успешно создано, выходим из цикла
      } catch (error) {
        // Обработка ошибки уникальности slug (race condition)
        if (isUniqueConstraintError(error, "slug")) {
          attempts++;
          // Генерируем новый slug с timestamp
          slug = `${finalBaseSlug}-${Date.now()}-${attempts}`;
          logger.warn(
            "Slug collision during registration, retrying with new slug",
            {
              originalSlug: finalBaseSlug,
              newSlug: slug,
              attempt: attempts,
            },
          );
          continue;
        }
        // Обработка ошибки уникальности email
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

    // Отправка письма с подтверждением email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    // Отправляем email асинхронно, не блокируя регистрацию
    // Но логируем ошибку для админов
    try {
      await sendVerificationEmail(email, name, verificationUrl);
    } catch (err) {
      logger.error("Failed to send verification email", {
        email,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return user;
  });
}
