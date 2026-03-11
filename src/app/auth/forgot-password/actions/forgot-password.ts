"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  sendPasswordResetLinkEmail,
  generatePasswordResetToken,
} from "@/lib/email";
import { checkPublicRateLimit } from "@/lib/rate-limit";

export interface ForgotPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function forgotPassword(
  email: string,
): Promise<ForgotPasswordResult> {
  // Применяем rate limiting для защиты от флуда email-рассылками
  const rateLimit = await checkPublicRateLimit("forgotPassword");

  if (rateLimit.success === false) {
    return { success: false, error: rateLimit.error.message };
  }

  try {
    if (!email || typeof email !== "string") {
      return { success: false, error: "Email обязателен" };
    }

    // Нормализуем email
    const normalizedEmail = email.toLowerCase().trim();

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Для безопасности всегда возвращаем успех, даже если пользователь не найден
    // Это предотвращает перебор email адресов
    if (!user) {
      logger.info("Password reset requested for non-existent email", {
        email: normalizedEmail,
      });

      return {
        success: true,
        message:
          "Если пользователь с таким email существует, ссылка для сброса пароля будет отправлена на его почту",
      };
    }

    // Генерируем токен для сброса пароля
    const resetToken = generatePasswordResetToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    // Сохраняем токен в БД
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        verificationTokenExpires: resetTokenExpires,
      },
    });

    logger.info("Password reset token generated for user", {
      userId: user.id,
      email: normalizedEmail,
    });

    // Отправляем email с ссылкой для сброса
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    const emailResult = await sendPasswordResetLinkEmail(user.email, resetUrl);

    if (!emailResult.success) {
      logger.error("Failed to send password reset email", {
        userId: user.id,
        error: emailResult.error,
      });

      return {
        success: false,
        error:
          "Не удалось отправить email. Пожалуйста, свяжитесь с поддержкой.",
      };
    }

    return {
      success: true,
      message: "Ссылка для сброса пароля отправлена на ваш email",
    };
  } catch (error) {
    logger.error("Error in forgotPassword action", {
      error: error instanceof Error ? error.message : String(error),
    });

    return { success: false, error: "Внутренняя ошибка сервера" };
  }
}
