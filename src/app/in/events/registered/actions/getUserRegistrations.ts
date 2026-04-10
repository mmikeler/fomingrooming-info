"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { action, UnauthorizedError, NotFoundError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import type { FeedItem } from "@/app/in/lenta/types";
import { getFeedItem } from "@/app/in/lenta/actions/getFeedItem";

/**
 * Получение списка регистраций пользователя с полной информацией о мероприятиях
 */
export async function getUserRegisteredEvents(): Promise<
  ActionResult<FeedItem[]>
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
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    const results = await Promise.all(
      registrations.map((reg) =>
        getFeedItem({ idOrSlug: reg.event.id.toString(), type: "EVENT" }),
      ),
    );

    // Extract successful results and handle any errors
    const feedItems: FeedItem[] = [];
    for (const result of results) {
      if (result.success && result.data) {
        feedItems.push(result.data);
      }
      // Optionally log failed fetches but don't fail the whole operation
      else if (!result.success) {
        console.warn(
          "Failed to fetch feed item(getUserRegisteredEvents):",
          result.error,
        );
      }
    }

    return feedItems;
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
    revalidatePath("/in/events/registered");

    return { success: true };
  });
}
