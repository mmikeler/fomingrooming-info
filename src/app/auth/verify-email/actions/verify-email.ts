"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface VerifyEmailResult {
  success: boolean;
  message: string;
}

/**
 * Верифицирует email пользователя по токену
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  try {
    if (!token || typeof token !== "string") {
      return {
        success: false,
        message: "Отсутствует токен подтверждения",
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      logger.warn("Verification failed: invalid token", {
        token: token.substring(0, 8) + "...",
      });
      return {
        success: false,
        message: "Недействительная ссылка для подтверждения",
      };
    }

    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      logger.warn("Verification failed: token expired", {
        userId: user.id,
        expires: user.verificationTokenExpires,
      });
      return {
        success: false,
        message:
          "Ссылка для подтверждения истекла. Пожалуйста, запросите новую ссылку",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    logger.info("Email verified successfully", { userId: user.id });

    return {
      success: true,
      message:
        "Ваш email успешно подтвержден! Теперь вы можете войти в систему.",
    };
  } catch (error) {
    logger.error("Verification error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      message:
        "Произошла ошибка при подтверждении email. Пожалуйста, попробуйте позже.",
    };
  }
}
