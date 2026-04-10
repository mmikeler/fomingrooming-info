"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/errors/result";
import type { PostCategory } from "@/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type {
  FeedItem,
  FeedItemType,
  FeedFilterType,
  GetFeedItemsParams,
  GetFeedItemsResult,
} from "../types";

/** Экспорт общих типов */
export type {
  FeedItem,
  FeedItemType,
  FeedFilterType,
  GetFeedItemsParams,
  GetFeedItemsResult,
};

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

    // Получаем ID зарегистрированных мероприятий для авторизованного пользователя
    let registeredEventIds: number[] = [];
    if (userId) {
      const registrations = await prisma.eventRegistration.findMany({
        where: { userId },
        select: { eventId: true },
      });
      registeredEventIds = registrations.map((r) => r.eventId);
    }

    // Получаем ID лайкнутых постов и мероприятий
    let likedPostIds: number[] = [];
    let likedEventIds: number[] = [];
    if (userId) {
      const likes = await prisma.like.findMany({
        where: { userId },
        select: {
          postId: true,
          eventId: true,
        },
      });
      likedPostIds = likes
        .map((l) => l.postId)
        .filter((id): id is number => id !== null);
      likedEventIds = likes
        .map((l) => l.eventId)
        .filter((id): id is number => id !== null);
    }

    // Получаем количество лайков для всех постов
    const postLikesCounts: Record<number, number> = {};
    const postIds = posts.map((p) => p.id);
    if (postIds.length > 0) {
      const postLikes = await prisma.like.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _count: true,
      });
      for (const pl of postLikes) {
        if (pl.postId !== null) {
          postLikesCounts[pl.postId] = pl._count;
        }
      }
    }

    // Получаем количество лайков для всех мероприятий
    const eventLikesCounts: Record<number, number> = {};
    const eventIds = events.map((e) => e.id);
    if (eventIds.length > 0) {
      const eventLikes = await prisma.like.groupBy({
        by: ["eventId"],
        where: { eventId: { in: eventIds } },
        _count: true,
      });
      for (const el of eventLikes) {
        if (el.eventId !== null) {
          eventLikesCounts[el.eventId] = el._count;
        }
      }
    }

    // Получаем количество просмотров для постов
    const postViewsCounts: Record<number, number> = {};
    if (postIds.length > 0) {
      const postViews = await prisma.postView.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _count: {
          views: true,
        },
      });
      for (const pv of postViews) {
        if (pv.postId !== null) {
          postViewsCounts[pv.postId] = pv._count.views;
        }
      }
    }

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
        isLiked: likedPostIds.includes(p.id),
        likesCount: postLikesCounts[p.id] || 0,
        viewsCount: postViewsCounts[p.id] || 0,
        isAuthor: userId === p.authorId,
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
        startRegDate: e.startRegDate,
        endRegDate: e.endRegDate,
        registrationsCount: e._count.registrations,
        isFavorite: favoriteEventIds.includes(e.id),
        isLiked: likedEventIds.includes(e.id),
        likesCount: eventLikesCounts[e.id] || 0,
        viewsCount: 0, // События пока без просмотров
        isAuthor: userId === e.authorId,
        isRegistered: registeredEventIds.includes(e.id),
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
