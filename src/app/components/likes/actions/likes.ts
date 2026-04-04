"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

// Типы записей для лайков
export type LikeItemType = "EVENT" | "POST";

/**
 * Переключение лайка для поста или мероприятия
 * @param itemId - ID записи
 * @param type - тип записи (EVENT или POST)
 */
export async function toggleLike(
  itemId: number,
  type: LikeItemType,
): Promise<ActionResult<{ isLiked: boolean; likesCount: number }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);

    // Проверяем, есть ли уже лайк
    const whereClause =
      type === "EVENT"
        ? { userId, eventId: itemId }
        : { userId, postId: itemId };

    const existing = await prisma.like.findFirst({
      where: whereClause,
    });

    let isLiked: boolean;

    if (existing) {
      // Удаляем лайк
      await prisma.like.delete({
        where: { id: existing.id },
      });
      isLiked = false;
    } else {
      // Проверяем, существует ли запись
      if (type === "EVENT") {
        const eventExists = await prisma.event.findUnique({
          where: { id: itemId },
          select: { id: true },
        });
        if (!eventExists) {
          throw new Error("Мероприятие не найдено");
        }
      } else {
        const postExists = await prisma.post.findUnique({
          where: { id: itemId },
          select: { id: true },
        });
        if (!postExists) {
          throw new Error("Пост не найден");
        }
      }

      // Добавляем лайк
      const data =
        type === "EVENT"
          ? { userId, eventId: itemId }
          : { userId, postId: itemId };

      await prisma.like.create({
        data,
      });
      isLiked = true;
    }

    // Получаем общее количество лайков
    const countClause =
      type === "EVENT" ? { eventId: itemId } : { postId: itemId };

    const likesCount = await prisma.like.count({
      where: countClause,
    });

    return { isLiked, likesCount };
  });
}

/**
 * Получение количества лайков для записи
 * @param itemId - ID записи
 * @param type - тип записи (EVENT или POST)
 */
export async function getLikesCount(
  itemId: number,
  type: LikeItemType,
): Promise<ActionResult<number>> {
  return action(async () => {
    const whereClause =
      type === "EVENT" ? { eventId: itemId } : { postId: itemId };

    const count = await prisma.like.count({
      where: whereClause,
    });

    return count;
  });
}

/**
 * Проверка, поставлен ли лайк пользователем
 * @param itemId - ID записи
 * @param type - тип записи (EVENT или POST)
 */
export async function isLiked(
  itemId: number,
  type: LikeItemType,
): Promise<ActionResult<{ isLiked: boolean }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { isLiked: false };
    }

    const userId = parseInt(session.user.id);

    const whereClause =
      type === "EVENT"
        ? { userId, eventId: itemId }
        : { userId, postId: itemId };

    const existing = await prisma.like.findFirst({
      where: whereClause,
    });

    return { isLiked: !!existing };
  });
}

/**
 * Получение списка ID записей с лайками пользователя
 * @param itemIds - массив ID записей
 * @param type - тип записи (EVENT или POST)
 */
export async function getLikedIds(
  itemIds: number[],
  type: LikeItemType,
): Promise<ActionResult<number[]>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || itemIds.length === 0) {
      return [];
    }

    const userId = parseInt(session.user.id);

    const whereClause =
      type === "EVENT"
        ? { userId, eventId: { in: itemIds } }
        : { userId, postId: { in: itemIds } };

    const likes = await prisma.like.findMany({
      where: whereClause,
      select:
        type === "EVENT"
          ? { eventId: true as const }
          : { postId: true as const },
    });

    return likes.map((l) =>
      type === "EVENT"
        ? (l as { eventId: number }).eventId
        : (l as { postId: number }).postId,
    );
  });
}

/**
 * Получение количества лайков для нескольких записей
 * @param itemIds - массив ID записей
 * @param type - тип записи (EVENT или POST)
 */
export async function getLikesCounts(
  itemIds: number[],
  type: LikeItemType,
): Promise<ActionResult<Record<number, number>>> {
  return action(async () => {
    if (itemIds.length === 0) {
      return {};
    }

    const whereClause =
      type === "EVENT"
        ? { eventId: { in: itemIds } }
        : { postId: { in: itemIds } };

    const likes = await prisma.like.groupBy({
      by: type === "EVENT" ? ["eventId"] : ["postId"],
      where: whereClause,
      _count: true,
    });

    const counts: Record<number, number> = {};
    for (const like of likes) {
      const key = type === "EVENT" ? like.eventId : like.postId;
      if (key !== null) {
        counts[key] = like._count;
      }
    }

    return counts;
  });
}
