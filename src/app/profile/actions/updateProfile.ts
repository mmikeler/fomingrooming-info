"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, ValidationError, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

interface UpdatedUser {
  id: number;
  name: string | null;
  email: string | null;
  city: string | null;
  phone: string | null;
  avatar: string | null;
  slug: string | null;
}

interface ProfileData {
  name: string;
  city?: string;
  phone?: string;
  avatar?: string | null;
  slug: string;
}

/**
 * Валидация имени пользователя
 */
function validateName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new ValidationError("Имя обязательно", {
      name: "Обязательное поле",
    });
  }
  if (trimmed.length < 2) {
    throw new ValidationError("Имя слишком короткое", {
      name: "Минимум 2 символа",
    });
  }
  if (trimmed.length > 100) {
    throw new ValidationError("Имя слишком длинное", {
      name: "Максимум 100 символов",
    });
  }
  return trimmed;
}

/**
 * Валидация города
 */
function validateCity(city?: string): string | undefined {
  if (!city || !city.trim()) {
    return undefined; // Город необязательный
  }
  const trimmed = city.trim();
  if (trimmed.length > 100) {
    throw new ValidationError("Название города слишком длинное", {
      city: "Максимум 100 символов",
    });
  }
  return trimmed;
}

/**
 * Валидация номера телефона
 */
function validatePhone(phone?: string): string | undefined {
  if (!phone || !phone.trim()) {
    return undefined; // Телефон необязательный
  }
  const trimmed = phone.trim();
  // Упрощённая валидация телефона - только цифры, пробелы, скобки, дефисы, плюс
  const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
  if (!phoneRegex.test(trimmed)) {
    throw new ValidationError("Неверный формат телефона", {
      phone: "От 7 до 20 символов (цифры, +, -, пробелы, скобки)",
    });
  }
  return trimmed;
}

/**
 * Валидация slug
 */
function validateSlug(slug: string): string {
  const trimmed = slug.trim().toLowerCase();

  if (!trimmed) {
    throw new ValidationError("Slug обязателен", {
      slug: "Обязательное поле",
    });
  }

  // Проверка формата slug
  const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  if (!slugRegex.test(trimmed)) {
    throw new ValidationError("Неверный формат slug", {
      slug: "Только латинские буквы, цифры и дефисы. Не должен начинаться или заканчиваться дефисом",
    });
  }
  if (trimmed.length < 3 || trimmed.length > 200) {
    throw new ValidationError("Slug слишком короткий или длинный", {
      slug: "От 3 до 200 символов",
    });
  }
  return trimmed;
}

/**
 * Обновление профиля пользователя
 */
export async function updateProfile(
  data: ProfileData,
): Promise<ActionResult<UpdatedUser>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);

    // Валидация данных
    const validatedName = validateName(data.name);
    const validatedCity = validateCity(data.city);
    const validatedPhone = validatePhone(data.phone);
    const validatedSlug = validateSlug(data.slug);

    // Проверка уникальности slug
    const existingUser = await prisma.user.findFirst({
      where: {
        slug: validatedSlug,
        NOT: { id: userId },
      },
      select: { id: true },
    });
    if (existingUser) {
      throw new ValidationError("Этот slug уже занят", {
        slug: "Slug уже используется другим пользователем",
      });
    }

    // Обновление пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedName,
        city: validatedCity,
        phone: validatedPhone,
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        slug: validatedSlug,
      },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        phone: true,
        avatar: true,
        slug: true,
      },
    });

    return updatedUser;
  });
}
