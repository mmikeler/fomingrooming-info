"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { FavoriteType } from "@/generated/prisma/enums";

interface FavoriteEvent {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  startDate: Date;
  format: "ONLINE" | "OFFLINE";
  city: string | null;
  createdAt: Date;
}

// Экспортируем тип для использования в компонентах
export type { FavoriteEvent };

/**
 * Переключение состояния избранного для мероприятия
 * Если в избранном - удаляет, если нет - добавляет
 */
export async function toggleFavorite(
  eventId: number,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);

    // Проверяем, есть ли уже в избранном
    const existing = await prisma.favorite.findFirst({
      where: {
        userId,
        type: FavoriteType.EVENT,
        eventId,
      },
    });

    if (existing) {
      // Удаляем из избранного
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorite: false };
    } else {
      // Добавляем в избранное
      await prisma.favorite.create({
        data: {
          userId,
          type: FavoriteType.EVENT,
          eventId,
        },
      });
      return { isFavorite: true };
    }
  });
}

/**
 * Проверка, находится ли мероприятие в избранном у текущего пользователя
 */
export async function isFavorite(
  eventId: number,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { isFavorite: false };
    }

    const userId = parseInt(session.user.id);

    const existing = await prisma.favorite.findFirst({
      where: {
        userId,
        type: FavoriteType.EVENT,
        eventId,
      },
    });

    return { isFavorite: !!existing };
  });
}

/**
 * Получение списка избранных мероприятий текущего пользователя
 */
export async function getFavoriteEvents(): Promise<
  ActionResult<FavoriteEvent[]>
> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        type: FavoriteType.EVENT,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            startDate: true,
            format: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Фильтруем и преобразуем данные
    const events = favorites
      .filter((f) => f.event !== null)
      .map((f) => ({
        id: f.event!.id,
        title: f.event!.title,
        slug: f.event!.slug,
        coverImage: f.event!.coverImage,
        startDate: f.event!.startDate,
        format: f.event!.format,
        city: f.event!.city,
        createdAt: f.createdAt,
      }));

    return events;
  });
}

/**
 * Получение списка ID избранных мероприятий (для пакетной проверки)
 */
export async function getFavoriteEventIds(
  eventIds: number[],
): Promise<ActionResult<number[]>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || eventIds.length === 0) {
      return [];
    }

    const userId = parseInt(session.user.id);

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        type: FavoriteType.EVENT,
        eventId: {
          in: eventIds,
        },
      },
      select: {
        eventId: true,
      },
    });

    return favorites.map((f) => f.eventId!);
  });
}
