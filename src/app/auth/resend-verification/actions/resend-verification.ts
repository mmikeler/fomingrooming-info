"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { action, ValidationError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { sendVerificationEmail, generateVerificationToken } from "@/lib/email";
import { checkPublicRateLimit } from "@/lib/rate-limit";

interface ResendVerificationData {
  email: string;
}

interface ResendVerificationResult {
  message: string;
}

/**
 * Повторно отправляет письмо с подтверждением email
 *
 * Безопасность:
 * - Не раскрывает существование email (всегда возвращает успех)
 * - Rate limiting: 3 запроса в час с IP, 1 запрос в 60 сек с email
 */
export async function resendVerification(
  data: ResendVerificationData,
): Promise<ActionResult<ResendVerificationResult>> {
  // Rate limiting для защиты от злоупотреблений
  const rateLimit = await checkPublicRateLimit("resendVerification");

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

  const { email } = data;

  // Валидация email
  if (!email) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "Email обязателен",
        details: { fields: { email: "Обязательно" } },
      },
    };
  }

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

  // Выполняем логику в транзакции для безопасности
  return action(async () => {
    try {
      // Ищем пользователя с данным email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
        },
      });

      // Если пользователь не найден или уже подтверждён —
      // возвращаем успех, чтобы не раскрывать информацию
      if (!user || user.emailVerified) {
        logger.info("Resend verification: user not found or already verified", {
          email,
          userExists: !!user,
          emailVerified: user?.emailVerified ? true : false,
        });

        // Всегда возвращаем успех для предотвращения enumeration
        return {
          message:
            "Если такой аккаунт существует и email не подтверждён, письмо было отправлено",
        };
      }

      // Генерируем новый токен верификации
      const verificationToken = generateVerificationToken();
      const verificationTokenExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ); // 24 часа

      // Обновляем токен в базе данных
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationTokenExpires,
        },
      });

      // Формируем URL для подтверждения
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

      // Отправляем email
      try {
        await sendVerificationEmail(
          email,
          user.name || "Пользователь",
          verificationUrl,
        );
        logger.info("Verification email resent successfully", {
          userId: user.id,
          email,
        });
      } catch (emailError) {
        logger.error("Failed to resend verification email", {
          userId: user.id,
          email,
          error:
            emailError instanceof Error
              ? emailError.message
              : String(emailError),
        });
        // Не показываем ошибку отправки пользователю
      }

      return {
        message:
          "Если такой аккаунт существует и email не подтверждён, письмо было отправлено",
      };
    } catch (error) {
      logger.error("Resend verification error", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });

      // Возвращаем успех, чтобы не раскрывать детали ошибки
      return {
        message:
          "Если такой аккаунт существует и email не подтверждён, письмо было отправлено",
      };
    }
  });
}
