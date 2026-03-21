"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { FavoriteType } from "@/generated/prisma/enums";

// Типы записей для избранного
export type FavoriteItemType = "EVENT" | "POST";

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
 * Универсальная функция проверки избранного для любого типа записи
 * @param itemId - ID записи
 * @param type - тип записи (EVENT или POST), по умолчанию EVENT
 */
export async function isFavorite(
  itemId: number,
  type: FavoriteItemType = "EVENT",
): Promise<ActionResult<{ isFavorite: boolean }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { isFavorite: false };
    }

    const userId = parseInt(session.user.id);
    const favoriteType =
      type === "EVENT" ? FavoriteType.EVENT : FavoriteType.POST;

    const whereClause =
      type === "EVENT"
        ? { userId, type: favoriteType, eventId: itemId }
        : { userId, type: favoriteType, postId: itemId };

    const existing = await prisma.favorite.findFirst({
      where: whereClause,
    });

    return { isFavorite: !!existing };
  });
}

/**
 * Универсальная функция переключения избранного для любого типа записи
 * @param itemId - ID записи
 * @param type - тип записи (EVENT или POST), по умолчанию EVENT
 */
export async function toggleFavorite(
  itemId: number,
  type: FavoriteItemType = "EVENT",
): Promise<ActionResult<{ isFavorite: boolean }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);
    const favoriteType =
      type === "EVENT" ? FavoriteType.EVENT : FavoriteType.POST;

    const whereClause =
      type === "EVENT"
        ? { userId, type: favoriteType, eventId: itemId }
        : { userId, type: favoriteType, postId: itemId };

    // Проверяем, есть ли уже в избранном
    const existing = await prisma.favorite.findFirst({
      where: whereClause,
    });

    // Проверяем, существует ли пользователь
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) {
      console.error("User not found:", userId);
      throw new Error("Пользователь не найден");
    }

    if (existing) {
      // Удаляем из избранного
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorite: false };
    } else {
      // Проверяем, существует ли запись (событие или пост)
      if (type === "EVENT") {
        const eventExists = await prisma.event.findUnique({
          where: { id: itemId },
          select: { id: true },
        });
        if (!eventExists) {
          console.error("Event not found:", itemId);
          throw new Error("Мероприятие не найдено");
        }
      } else {
        const postExists = await prisma.post.findUnique({
          where: { id: itemId },
          select: { id: true },
        });
        if (!postExists) {
          console.error("Post not found:", itemId);
          throw new Error("Пост не найден");
        }
      }

      // Добавляем в избранное
      const data =
        type === "EVENT"
          ? { userId, type: favoriteType, eventId: itemId }
          : { userId, type: favoriteType, postId: itemId };

      console.log("Creating favorite:", { data, userId, type, itemId });

      try {
        await prisma.favorite.create({
          data,
        });
      } catch (error: unknown) {
        console.error("Prisma error creating favorite:", error);
        if (
          error instanceof Error &&
          error.message.includes("Foreign key constraint")
        ) {
          throw new Error("Ошибка связи: неверный ID пользователя или записи");
        }
        throw error;
      }
      return { isFavorite: true };
    }
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
