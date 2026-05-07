"use server";

import { prisma } from "@/lib/prisma";
import { action } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { FeedItem } from "@/app/in/lenta/types";

/**
 * Зарегистрировать просмотр поста
 * Увеличивает счётчик просмотров на 1
 * @param postId - ID поста
 * @returns Количество просмотров после регистрации
 */
export async function trackPostView(
  postId: number,
  postType: FeedItem["type"],
): Promise<ActionResult<{ viewsCount: number }>> {
  return action(async () => {
    let updated;

    switch (postType) {
      case "EVENT":
        updated = await prisma.event.update({
          where: { id: postId },
          data: { viewsCount: { increment: 1 } },
          select: { viewsCount: true },
        });
        break;
      default:
        updated = await prisma.post.update({
          where: { id: postId },
          data: { viewsCount: { increment: 1 } },
          select: { viewsCount: true },
        });
    }

    return { viewsCount: updated.viewsCount };
  });
}

/**
 * Получить количество просмотров поста
 * @param postId - ID поста
 * @returns Количество просмотров
 */
export async function getPostViewsCount(
  postId: number,
): Promise<ActionResult<number>> {
  return action(async () => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { viewsCount: true },
    });

    return post?.viewsCount || 0;
  });
}

/**
 * Зарегистрировать просмотр мероприятия
 * Увеличивает счётчик просмотров на 1
 * @param eventId - ID мероприятия
 * @returns Количество просмотров после регистрации
 */
export async function trackEventView(
  eventId: number,
): Promise<ActionResult<{ viewsCount: number }>> {
  return action(async () => {
    // Увеличиваем счётчик просмотров
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
      select: { viewsCount: true },
    });

    return { viewsCount: updated.viewsCount };
  });
}

/**
 * Получить количество просмотров мероприятия
 * @param eventId - ID мероприятия
 * @returns Количество просмотров
 */
export async function getEventViewsCount(
  eventId: number,
): Promise<ActionResult<number>> {
  return action(async () => {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { viewsCount: true },
    });

    return event?.viewsCount || 0;
  });
}
