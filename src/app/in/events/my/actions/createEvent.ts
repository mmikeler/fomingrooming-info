"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { action, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { EventFormat, EventStatus, EventType } from "@/generated/prisma/enums";
import { generateEventUniqueSlug } from "./checkEventSlug";
import { canCreateContent } from "@/lib/permissions";

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

    // Проверка статуса аккаунта
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { status: true, city: true },
    });

    if (!user || !canCreateContent(user.status)) {
      throw new ForbiddenError(
        "Ваш аккаунт ограничен. Вы не можете создавать мероприятия.",
      );
    }

    // Генерация уникального slug
    const slugResult = await generateEventUniqueSlug("Новое мероприятие");
    if (!slugResult.success) {
      throw new Error("Ошибка при генерации slug");
    }

    // Создание мероприятия как черновика
    const now = new Date();
    const startRegDate = new Date(now.setDate(now.getDate() + 1));
    startRegDate.setHours(0, 0, 0, 0);
    const endRegDate = new Date(now.setDate(now.getDate() + 5));
    endRegDate.setHours(0, 0, 0, 0);
    const startDate = new Date(now.setDate(now.getDate() + 6));
    startDate.setHours(10, 0, 0, 0);
    const endDate = new Date(now.setDate(now.getDate() + 6));
    endDate.setHours(18, 0, 0, 0);

    const event = await prisma.event.create({
      data: {
        title: "Новое мероприятие",
        slug: slugResult.data,
        description: null,
        format: EventFormat.ONLINE,
        type: EventType.VEBINAR,
        city: user.city || null,
        location: null,
        startDate,
        endDate,
        startRegDate,
        endRegDate,
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
    revalidatePath("/in/events/my");

    return event;
  });
}
