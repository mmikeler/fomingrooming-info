"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, ValidationError, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import bcrypt from "bcryptjs";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Валидация текущего пароля
 */
function validateCurrentPassword(password: string): string {
  const trimmed = password.trim();
  if (!trimmed) {
    throw new ValidationError("Текущий пароль обязателен", {
      currentPassword: "Обязательное поле",
    });
  }
  return trimmed;
}

/**
 * Валидация нового пароля
 */
function validateNewPassword(password: string): string {
  const trimmed = password.trim();
  if (!trimmed) {
    throw new ValidationError("Новый пароль обязателен", {
      newPassword: "Обязательное поле",
    });
  }
  if (trimmed.length < 6) {
    throw new ValidationError("Пароль слишком короткий", {
      newPassword: "Минимум 6 символов",
    });
  }
  if (trimmed.length > 100) {
    throw new ValidationError("Пароль слишком длинный", {
      newPassword: "Максимум 100 символов",
    });
  }
  return trimmed;
}

/**
 * Изменение пароля пользователя
 */
export async function changePassword(
  data: PasswordData,
): Promise<ActionResult<{ success: boolean }>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Валидация данных
    const validatedCurrentPassword = validateCurrentPassword(
      data.currentPassword,
    );
    const validatedNewPassword = validateNewPassword(data.newPassword);

    // Проверка совпадения новых паролей
    if (data.newPassword !== data.confirmPassword) {
      throw new ValidationError("Пароли не совпадают", {
        confirmPassword: "Пароли должны совпадать",
      });
    }

    // Получаем пользователя из базы данных
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { password: true },
    });

    if (!user || !user.password) {
      throw new ValidationError("У пользователя нет пароля", {
        currentPassword: "Невозможно изменить пароль",
      });
    }

    // Проверка текущего пароля
    const isPasswordValid = await bcrypt.compare(
      validatedCurrentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationError("Неверный текущий пароль", {
        currentPassword: "Неверный пароль",
      });
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(validatedNewPassword, 10);

    // Обновление пароля
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true };
  });
}
