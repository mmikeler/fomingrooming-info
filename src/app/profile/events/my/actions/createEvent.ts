"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { EventStatus } from "@/generated/prisma/enums";
import { generateEventUniqueSlug } from "./checkEventSlug";

interface CreatedEvent {
  id: number;
  title: string;
  slug: string;
  status: EventStatus;
  authorId: number;
}

/**
 * Создание нового мероприятия
 * Мероприятие создаётся как черновик (DRAFT)
 */
export async function createEvent(): Promise<ActionResult<CreatedEvent>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError(
        "Необходима авторизация для создания мероприятия",
      );
    }

    // Генерация уникального slug
    const slugResult = await generateEventUniqueSlug("Новое мероприятие");
    if (!slugResult.success) {
      throw new Error("Ошибка при генерации slug");
    }

    // Создание мероприятия как черновика
    const event = await prisma.event.create({
      data: {
        title: "Новое мероприятие",
        slug: slugResult.data,
        description: null,
        format: "OFFLINE",
        city: null,
        location: null,
        startDate: new Date(),
        endDate: new Date(),
        coverImage: null,
        status: EventStatus.DRAFT,
        authorId: parseInt(session.user.id),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        authorId: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/events");

    return event;
  });
}
