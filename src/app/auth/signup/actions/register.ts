"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  action,
  ValidationError,
  ConflictError,
  isUniqueConstraintError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface RegisteredUser {
  id: number;
  name: string | null;
  email: string | null;
}

/**
 * Регистрация нового пользователя с данными
 */
export async function register(
  data: RegisterData,
): Promise<ActionResult<RegisteredUser>> {
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

  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 12);

  // Создание пользователя с обработкой ошибок
  return action(async () => {
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      // Обработка ошибки уникальности email
      if (isUniqueConstraintError(error, "email")) {
        throw new ConflictError("Пользователь с таким email уже существует");
      }
      throw error;
    }
  });
}
