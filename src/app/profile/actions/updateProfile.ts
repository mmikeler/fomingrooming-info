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
}

/**
 * Обновление профиля пользователя
 */
export async function updateProfile(
  name: string,
): Promise<ActionResult<UpdatedUser>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Валидация
    if (!name || !name.trim()) {
      throw new ValidationError("Имя обязательно", {
        name: "Обязательное поле",
      });
    }

    // Обновление пользователя
    return prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true },
    });
  });
}
