"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface VKLoginResult {
  action: "login";
  slug: string;
  redirectTo: string;
}

interface VKRegisterResult {
  action: "register";
  vkUserId: string;
  name: string;
  avatar: string | null;
  city: string | null;
}

export type ExchangeVKCodeResult = VKLoginResult | VKRegisterResult;

/**
 * Обменивает code VK OAuth на access_token и получает данные пользователя VK.
 * Проверяет, существует ли пользователь в БД по slug = "vk-{vkUserId}".
 * Если существует — возвращает action "login", иначе "register" с данными.
 */
export async function exchangeVKCode(
  accessToken: string,
  vkUserId: string,
): Promise<ExchangeVKCodeResult> {
  try {
    if (!accessToken || !vkUserId) {
      logger.error("VK token response missing access_token or user_id", {
        response: { accessToken, vkUserId },
      });
      throw new Error("Invalid VK token response");
    }

    // Шаг 2: Получение данных пользователя VK
    const userResponse = await fetch("https://api.vk.com/method/users.get", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: accessToken,
        v: "5.199",
        fields: "photo_200,city",
      }),
    });

    if (!userResponse.ok) {
      logger.error("VK users.get failed", {
        status: userResponse.status,
      });
      throw new Error("Failed to get VK user info");
    }

    const userData = await userResponse.json();

    if (userData.error) {
      logger.error("VK API error in users.get", {
        error: userData.error,
        error_msg: userData.error.error_msg,
      });
      throw new Error(userData.error.error_msg || "Failed to get VK user info");
    }

    const vkUser = userData.response?.[0];

    if (!vkUser) {
      logger.error("VK users.get returned empty response", {
        response: userData,
      });
      throw new Error("VK user not found");
    }

    // Формируем имя
    const name = [vkUser.first_name, vkUser.last_name]
      .filter(Boolean)
      .join(" ");

    // Получаем аватар
    const avatar = vkUser.photo_200 || null;

    // Получаем город
    let city: string | null = null;
    if (vkUser.city?.title) {
      city = vkUser.city.title;
    }

    // Slug для поиска в БД
    const slug = `vk-${vkUserId}`;

    // Шаг 3: Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (existingUser) {
      // Проверка статуса
      if (existingUser.status === "BANNED") {
        logger.warn("Banned VK user attempted login", {
          userId: existingUser.id,
          vkUserId,
        });
        throw new Error("ACCOUNT_BANNED");
      }

      logger.info("Existing VK user logged in", {
        userId: existingUser.id,
        vkUserId,
      });

      return {
        action: "login",
        slug: existingUser.slug,
        redirectTo: "/in",
      };
    }

    // Шаг 4: Пользователь не найден — возвращаем данные для регистрации
    logger.info("New VK user needs registration", {
      vkUserId,
      name,
    });

    return {
      action: "register",
      vkUserId,
      name,
      avatar,
      city,
    };
  } catch (error) {
    logger.error("VK exchange code error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
