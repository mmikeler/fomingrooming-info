"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { action, UnauthorizedError, NotFoundError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { EventStatus, EventFormat } from "@/generated/prisma/enums";

/**
 * Интерфейс для полной информации о мероприятии в регистрации
 */
export interface RegisteredEvent {
  id: number;
  eventId: number;
  registeredAt: Date;
  event: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    format: EventFormat;
    city: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date;
    coverImage: string | null;
    status: EventStatus;
  };
}

/**
 * Получение списка регистраций пользователя с полной информацией о мероприятиях
 */
export async function getUserRegisteredEvents(): Promise<
  ActionResult<RegisteredEvent[]>
> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            format: true,
            city: true,
            location: true,
            startDate: true,
            endDate: true,
            coverImage: true,
            status: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    return registrations;
  });
}

/**
 * Отмена регистрации пользователя на мероприятие
 */
export async function cancelEventRegistration(
  eventId: number,
): Promise<ActionResult<{ success: boolean }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError(
        "Необходима авторизация для отмены регистрации",
      );
    }

    const userId = parseInt(session.user.id);

    // Поиск регистрации
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundError("Регистрация не найдена");
    }

    // Удаление регистрации
    await prisma.eventRegistration.delete({
      where: {
        id: registration.id,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/events/registered");
    revalidatePath(`/events/${eventId}`);

    return { success: true };
  });
}
