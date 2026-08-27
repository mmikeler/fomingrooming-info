"use server";

import { FeedItem, FeedFilterType } from "@/app/in/lenta/types";
import { Event, Post } from "@/generated/prisma/client";
import { action, ActionResult } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

type PostWithAuthor = Post & { author: { name: string } };
type EventWithAuthor = Event & { author: { name: string } };
type RecommendationsResult = PostWithAuthor[] | EventWithAuthor[] | null;

/**
 * Функция для получения рекомендаций для переданной записи
 * Возвращает записи того же типа и категории, стоящие перед и после в выдаче
 */
export async function getRecommendations(
  record: FeedItem,
  limit = 2,
): Promise<ActionResult<RecommendationsResult>> {
  const filter: FeedFilterType =
    record.type === "EVENT"
      ? "EVENT"
      : record.category === "NEWS"
        ? "NEWS"
        : "ARTICLE";

  return action(async () => {
    // Если фильтр - событие, возвращаем список событий
    if (filter === "EVENT") {
      const events = await prisma.event.findMany({
        where: {
          status: "PUBLISHED",
          NOT: {
            id: record.id,
          },
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        take: limit,
      });

      return events;
    }

    // Иначе возвращаем список статей соответствующей категории
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        category: record.category,
        NOT: {
          id: record.id,
        },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
    });

    return posts;
  });
}
