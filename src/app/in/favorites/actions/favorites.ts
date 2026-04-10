"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { FavoriteType } from "@/generated/prisma/enums";
import type { FeedItem } from "@/app/in/lenta/types";
import { getFeedItem } from "../../lenta/actions/getFeedItem";

// Типы записей для избранного
export type FavoriteItemType = "EVENT" | "POST";

export type FavoriteItem =
  | {
      id: number;
      itemType: "EVENT";
      createdAt: Date;
      title: string;
      slug: string;
      coverImage: string | null;
      // Для событий
      startDate: Date;
      endDate?: Date;
      startRegDate: Date;
      endRegDate: Date;
      format: "ONLINE" | "OFFLINE";
      city: string | null;
      location?: string | null;
      description?: string | null;
      // Информация об авторе
      author: {
        id: number;
        name: string;
        slug: string;
        avatar: string | null;
      };
    }
  | {
      id: number;
      itemType: "POST";
      createdAt: Date;
      title: string;
      slug: string;
      coverImage: string | null;
      // Для постов
      content: string | null;
      category: string;
      description?: string | null;
      // Информация об авторе
      author: {
        id: number;
        name: string;
        slug: string;
        avatar: string | null;
      };
    };

/**
 * Получение всех избранных элементов (события и посты)
 */
export async function getAllFavorites(): Promise<ActionResult<FeedItem[]>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        event: {
          select: { slug: true },
        },
        post: {
          select: { slug: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const feedItemResults = await Promise.all(
      favorites.map(async (f) => {
        if (f.post) {
          return await getFeedItem({ idOrSlug: f.post.slug, type: "POST" });
        }
        if (f.event) {
          return await getFeedItem({ idOrSlug: f.event.slug, type: "EVENT" });
        }
        return undefined;
      }),
    );

    // Filter out undefined results and extract successful data
    const successfulItems: FeedItem[] = feedItemResults
      .filter(
        (result): result is { success: true; data: FeedItem } =>
          result !== undefined && result.success,
      )
      .map((result) => result.data);

    return successfulItems;
  });
}

/**
 * Получение списка ID избранных постов (для пакетной проверки)
 */
export async function getFavoritePostIds(
  postIds: number[],
): Promise<ActionResult<number[]>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || postIds.length === 0) {
      return [];
    }

    const userId = parseInt(session.user.id);

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        type: FavoriteType.POST,
        postId: {
          in: postIds,
        },
      },
      select: {
        postId: true,
      },
    });

    return favorites.map((f) => f.postId!);
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
