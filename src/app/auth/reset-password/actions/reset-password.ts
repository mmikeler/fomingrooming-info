"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { action, ValidationError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
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
 * Сброс пароля по токену
 */
export async function resetPassword(
  data: ResetPasswordData,
): Promise<ActionResult<{ success: boolean }>> {
  return action(async () => {
    const { token, newPassword, confirmPassword } = data;

    // Валидация пароля
    const validatedPassword = validateNewPassword(newPassword);

    // Проверка совпадения паролей
    if (newPassword !== confirmPassword) {
      throw new ValidationError("Пароли не совпадают", {
        confirmPassword: "Пароли должны совпадать",
      });
    }

    // Поиск пользователя по токену
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      throw new ValidationError("Недействительная ссылка для сброса пароля", {
        token: "Недействительный токен",
      });
    }

    // Проверка срока действия токена
    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      throw new ValidationError("Ссылка для сброса пароля истекла", {
        token: "Токен истёк. Запросите новую ссылку",
      });
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(validatedPassword, 10);

    // Обновление пароля и очистка токена
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    logger.info("Password reset successfully", { userId: user.id });

    return { success: true };
  });
}
