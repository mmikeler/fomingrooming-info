"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  action,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { EventStatus } from "@/generated/prisma/enums";

interface DeletedEvent {
  id: number;
  title: string;
}

/**
 * Удаление мероприятия
 * Удалить можно только черновики, отклонённые или архивные мероприятия
 */
export async function deleteEvent(
  id: number,
): Promise<ActionResult<DeletedEvent>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Поиск мероприятия с проверкой владельца
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingEvent) {
      throw new NotFoundError("Мероприятие", id);
    }

    // Проверка: можно удалить только черновик, отклонённое или архивное мероприятие
    if (
      existingEvent.status === EventStatus.PUBLISHED ||
      existingEvent.status === EventStatus.PENDING
    ) {
      throw new BadRequestError(
        "Нельзя удалить опубликованное мероприятие или мероприятие на модерации",
      );
    }

    // Удаление мероприятия
    const deletedEvent = await prisma.event.delete({
      where: { id },
      select: {
        id: true,
        title: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/events");

    return deletedEvent;
  });
}
