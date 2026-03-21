"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/errors/result";
import type {
  PostCategory,
  EventFormat,
  EventType,
} from "@/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Тип элемента ленты */
export type FeedItemType = "POST" | "EVENT";

export interface FeedItem {
  id: number;
  type: FeedItemType;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  date: Date;
  author: {
    id: number;
    name: string;
    slug: string;
    avatar: string | null;
  };
  // Для постов
  content?: string | null;
  category?: PostCategory;
  // Для событий
  format?: EventFormat;
  eventType?: EventType | null;
  city?: string | null;
  location?: string | null;
  startDate?: Date;
  endDate?: Date;
  registrationsCount?: number;
  // Избранное
  isFavorite: boolean;
}

export type FeedFilterType = "ALL" | "EVENT" | "NEWS" | "ARTICLE";

export interface GetFeedItemsParams {
  /** Курсор для пагинации (дата последнего элемента) */
  cursor?: string; // ISO date string
  limit?: number;
  filter?: FeedFilterType;
}

export interface GetFeedItemsResult {
  items: FeedItem[];
  nextCursor: string | null; // ISO date string
  hasMore: boolean;
  totalCount: number;
}

/**
 * Получить элементы ленты (посты и мероприятия)
 * Объединение происходит в JavaScript
 * Сортировка по дате (для постов - created, для событий - startDate)
 */
export async function getFeedItems(
  params: GetFeedItemsParams = {},
): Promise<ActionResult<GetFeedItemsResult>> {
  try {
    const { cursor, limit = 10, filter = "ALL" } = params;

    // Получаем сессию для проверки избранного
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    // Получаем ID избранных элементов
    let favoritePostIds: number[] = [];
    let favoriteEventIds: number[] = [];
    if (userId) {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        select: {
          type: true,
          postId: true,
          eventId: true,
        },
      });
      favoritePostIds = favorites
        .filter((f) => f.type === "POST")
        .map((f) => f.postId!);
      favoriteEventIds = favorites
        .filter((f) => f.type === "EVENT")
        .map((f) => f.eventId!);
    }

    // Получаем опубликованные посты
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
      },
      orderBy: { created: "desc" },
      take: limit + 1,
    });

    // Получаем опубликованные мероприятия
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startDate: "desc" },
      take: limit + 1,
    });

    // Объединяем посты и события
    const allItems: FeedItem[] = [
      ...posts.map((p) => ({
        id: p.id,
        type: "POST" as FeedItemType,
        title: p.title,
        slug: p.slug,
        description: p.content,
        coverImage: p.coverImage,
        date: p.created,
        author: p.author,
        content: p.content,
        category: p.category as PostCategory,
        isFavorite: favoritePostIds.includes(p.id),
      })),
      ...events.map((e) => ({
        id: e.id,
        type: "EVENT" as FeedItemType,
        title: e.title,
        slug: e.slug,
        description: e.description,
        coverImage: e.coverImage,
        date: e.startDate,
        author: e.author,
        format: e.format,
        eventType: e.type,
        city: e.city,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        registrationsCount: e._count.registrations,
        isFavorite: favoriteEventIds.includes(e.id),
      })),
    ];

    // Сортируем по дате (новые первыми)
    allItems.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Применяем фильтр
    let resultItemsList = allItems;
    if (filter !== "ALL") {
      resultItemsList = allItems.filter((item) => {
        if (filter === "EVENT") {
          return item.type === "EVENT";
        } else if (filter === "NEWS") {
          return item.type === "POST" && item.category === "NEWS";
        } else if (filter === "ARTICLE") {
          return item.type === "POST" && item.category === "ARTICLE";
        }
        return true;
      });
    }

    // Применяем курсор если передан - показываем более старые элементы
    if (cursor) {
      const cursorDate = new Date(cursor);
      resultItemsList = resultItemsList.filter(
        (item) => item.date.getTime() < cursorDate.getTime(),
      );
    }

    // Проверяем есть ли еще элементы
    const hasMore = resultItemsList.length > limit;
    const resultItems = hasMore
      ? resultItemsList.slice(0, limit)
      : resultItemsList;
    // nextCursor - дата последнего элемента для следующей страницы
    const nextCursor = hasMore
      ? resultItems[resultItems.length - 1].date.toISOString()
      : null;

    // Подсчитываем общее количество
    const [postsCount, eventsCount] = await Promise.all([
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
    ]);
    const totalCount = postsCount + eventsCount;

    return {
      success: true,
      data: {
        items: resultItems,
        nextCursor,
        hasMore,
        totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Не удалось загрузить ленту",
      },
    };
  }
}
