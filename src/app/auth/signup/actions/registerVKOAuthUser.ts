"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { action } from "@/lib/errors";
import { hash } from "bcryptjs";
import type { ActionResult } from "@/lib/errors";

interface RegisterVKOAuthData {
  vkUserId: number;
  name: string;
  email?: string;
  avatar?: string | null;
  city?: string | null;
}

interface RegisteredUser {
  id: number;
  name: string | null;
  email: string | null;
  slug: string;
}

/**
 * Регистрация пользователя через VK OAuth.
 * slug = "vk-{vkUserId}" (уникальный идентификатор VK).
 * Если email не предоставлен — используется "vk-{vkUserId}@vk.id"
 */
export async function registerVKOAuthUser(
  data: RegisterVKOAuthData,
): Promise<ActionResult<RegisteredUser>> {
  const { vkUserId, name, email, avatar, city } = data;

  if (!vkUserId || !name) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "VK ID и имя обязательны",
      },
    };
  }

  const slug = `vk-${vkUserId}`;

  // Проверка, не зарегистрирован ли уже пользователь
  const existingUser = await prisma.user.findUnique({
    where: { slug },
  });

  if (existingUser) {
    return {
      success: false,
      error: {
        code: "CONFLICT",
        message: "Пользователь с таким VK ID уже зарегистрирован",
      },
    };
  }

  // Если email не предоставлен VK, используем заглушку
  const userEmail = email || `vk-${vkUserId}@vk.id`;

  // Генерация пароля (VK пользователи не вводят пароль)
  const password = await hash(`vk-${vkUserId}-${new Date().getTime()}`, 10);

  return action(async () => {
    const user = await prisma.user.create({
      data: {
        name,
        email: userEmail,
        slug,
        password,
        avatar: avatar || null,
        city: city || null,
        emailVerified: new Date(), // VK пользователь считается верифицированным
        provider: "VK",
      },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
      },
    });

    logger.info("New user registered via VK OAuth", {
      userId: user.id,
      slug: user.slug,
      email: user.email,
    });

    return user;
  });
}
