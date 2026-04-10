"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/errors/result";
import type { PostCategory, EventType } from "@/generated/prisma/enums";
import { EventStatus } from "@/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { FeedItem, GetFeedItemParams } from "../types";

/** Удалить после миграции - экспорт для совместимости */
export type { FeedItem, GetFeedItemParams };

/**
 * Универсальный серверный экшен для получения поста или мероприятия как FeedItem
 *
 * Принимает ID или slug и тип (POST/EVENT), возвращает унифицированный формат FeedItem
 * Автоматически определяет тип поста/мероприятия, если тип не указан
 * Добавляет информацию об избранном для авторизованных пользователей
 */
export async function getFeedItem(
  params: GetFeedItemParams,
): Promise<ActionResult<FeedItem>> {
  try {
    const { idOrSlug, type } = params;

    // Определяем, является ли входной параметр числовым ID
    const isNumericId = /^\d+$/.test(idOrSlug);
    const id = isNumericId ? parseInt(idOrSlug, 10) : undefined;
    const slug = isNumericId ? undefined : idOrSlug;

    // Получаем сессию для проверки избранного
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    // Ищем пост или мероприятие
    let feedItem: FeedItem | null = null;

    if (type === "POST" || !type) {
      // Пробуем найти пост
      const post = await prisma.post.findFirst({
        where: id ? { id } : slug ? { slug } : { id: 0 }, // Не найдет никогда, если нет id или slug
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
      });

      if (post) {
        // Параллельно получаем избранное, лайки и просмотры
        const [favoriteResult, likesResult, viewsResult] = await Promise.all([
          // Избранное
          userId
            ? prisma.favorite.findFirst({
                where: { userId, type: "POST", postId: post.id },
              })
            : Promise.resolve(null),
          // Лайки (количество и статус)
          Promise.all([
            prisma.like.count({ where: { postId: post.id } }),
            userId
              ? prisma.like.findFirst({
                  where: { userId, postId: post.id },
                })
              : Promise.resolve(null),
          ]),
          // Просмотры
          prisma.postView.aggregate({
            where: { postId: post.id },
            _sum: { views: true },
          }),
        ]);

        const isFavorite = !!favoriteResult;
        const likesCount = likesResult[0];
        const isLiked = !!likesResult[1];
        const viewsCount = viewsResult._sum.views || 0;

        feedItem = {
          id: post.id,
          type: "POST",
          title: post.title,
          slug: post.slug,
          description: post.content,
          coverImage: post.coverImage,
          date: post.created,
          author: post.author,
          content: post.content,
          category: post.category as PostCategory,
          isFavorite,
          isLiked,
          likesCount,
          viewsCount,
          isAuthor: userId === post.authorId,
        };
      }
    }

    if (!feedItem && (type === "EVENT" || !type)) {
      // Пробуем найти мероприятие
      const event = await prisma.event.findFirst({
        where: id ? { id } : slug ? { slug } : { id: 0 },
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
      });

      if (event) {
        // Параллельно получаем избранное, регистрацию и лайки
        const [favoriteResult, registrationResult, likesResult] =
          await Promise.all([
            // Избранное
            userId
              ? prisma.favorite.findFirst({
                  where: { userId, type: "EVENT", eventId: event.id },
                })
              : Promise.resolve(null),
            // Регистрация на мероприятие
            userId
              ? prisma.eventRegistration.findFirst({
                  where: { userId, eventId: event.id },
                })
              : Promise.resolve(null),
            // Лайки (количество и статус)
            Promise.all([
              prisma.like.count({ where: { eventId: event.id } }),
              userId
                ? prisma.like.findFirst({
                    where: { userId, eventId: event.id },
                  })
                : Promise.resolve(null),
            ]),
          ]);

        const isFavorite = !!favoriteResult;
        const isRegistered = !!registrationResult;
        const likesCount = likesResult[0];
        const isLiked = !!likesResult[1];

        feedItem = {
          id: event.id,
          type: "EVENT",
          title: event.title,
          slug: event.slug,
          description: event.description,
          coverImage: event.coverImage,
          date: event.startDate,
          author: event.author,
          format: event.format,
          eventType: event.type as EventType | null,
          city: event.city,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          startRegDate: event.startRegDate,
          endRegDate: event.endRegDate,
          registrationsCount: event._count.registrations,
          isFavorite,
          isLiked,
          likesCount,
          viewsCount: 0, // События пока без просмотров
          isAuthor: userId === event.authorId,
          isRegistered,
        };
      }
    }

    if (!feedItem) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Пост или мероприятие не найдены",
        },
      };
    }

    return {
      success: true,
      data: feedItem,
    };
  } catch (error) {
    console.error("Error fetching feed item:", error);
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Не удалось загрузить элемент ленты",
      },
    };
  }
}

/**
 * Получить опубликованный пост как FeedItem
 * Проверяет статус и возвращает ошибку для неопубликованных постов
 * (если пользователь не является автором или модератором)
 */
export async function getPublishedPost(
  idOrSlug: string,
): Promise<ActionResult<FeedItem>> {
  try {
    const isNumericId = /^\d+$/.test(idOrSlug);
    const id = isNumericId ? parseInt(idOrSlug, 10) : undefined;
    const slug = isNumericId ? undefined : idOrSlug;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const post = await prisma.post.findFirst({
      where: id ? { id } : slug ? { slug } : { id: 0 },
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
    });

    if (!post) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Пост не найден",
        },
      };
    }

    // Проверяем статус - только опубликованные посты видны всем
    if (post.status !== "PUBLISHED") {
      // Если автор или модератор - показываем
      const isAuthor = userId === post.authorId;

      // Проверяем, является ли пользователь модератором
      let isModerator = false;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        if (user) {
          const { canModerate } = await import("@/lib/permissions");
          isModerator = canModerate(user.role);
        }
      }

      if (!isAuthor && !isModerator) {
        return {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Пост не опубликован",
          },
        };
      }
    }

    // Параллельно получаем избранное, лайки и просмотры
    const [favoriteResult, likesResult, viewsResult] = await Promise.all([
      // Избранное
      userId
        ? prisma.favorite.findFirst({
            where: { userId, type: "POST", postId: post.id },
          })
        : Promise.resolve(null),
      // Лайки (количество и статус)
      Promise.all([
        prisma.like.count({ where: { postId: post.id } }),
        userId
          ? prisma.like.findFirst({
              where: { userId, postId: post.id },
            })
          : Promise.resolve(null),
      ]),
      // Просмотры
      prisma.postView.aggregate({
        where: { postId: post.id },
        _sum: { views: true },
      }),
    ]);

    const isFavorite = !!favoriteResult;
    const likesCount = likesResult[0];
    const isLiked = !!likesResult[1];
    const viewsCount = viewsResult._sum.views || 0;

    const feedItem: FeedItem = {
      id: post.id,
      type: "POST",
      title: post.title,
      slug: post.slug,
      description: post.content,
      coverImage: post.coverImage,
      date: post.created,
      author: post.author,
      content: post.content,
      category: post.category as PostCategory,
      isFavorite,
      isLiked,
      likesCount,
      viewsCount,
      isAuthor: userId === post.authorId,
    };

    return {
      success: true,
      data: feedItem,
    };
  } catch (error) {
    console.error("Error fetching published post:", error);
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Не удалось загрузить пост",
      },
    };
  }
}

/**
 * Получить опубликованное мероприятие как FeedItem
 * Проверяет статус и возвращает ошибку для неопубликованных мероприятий
 * (если пользователь не является автором или модератором)
 */
export async function getPublishedEvent(
  idOrSlug: string,
): Promise<ActionResult<FeedItem>> {
  try {
    const isNumericId = /^\d+$/.test(idOrSlug);
    const id = isNumericId ? parseInt(idOrSlug, 10) : undefined;
    const slug = isNumericId ? undefined : idOrSlug;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const event = await prisma.event.findFirst({
      where: id ? { id } : slug ? { slug } : { id: 0 },
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
    });

    if (!event) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Мероприятие не найдено",
        },
      };
    }

    // Проверяем статус - только опубликованные мероприятия видны всем
    if (event.status !== EventStatus.PUBLISHED) {
      const isAuthor = userId === event.authorId;

      // Проверяем, является ли пользователь модератором
      let isModerator = false;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        if (user) {
          const { canModerate } = await import("@/lib/permissions");
          isModerator = canModerate(user.role);
        }
      }

      if (!isAuthor && !isModerator) {
        return {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Мероприятие не опубликовано",
          },
        };
      }
    }

    // Параллельно получаем избранное, регистрацию и лайки
    const [favoriteResult, registrationResult, likesResult] = await Promise.all(
      [
        // Избранное
        userId
          ? prisma.favorite.findFirst({
              where: { userId, type: "EVENT", eventId: event.id },
            })
          : Promise.resolve(null),
        // Регистрация на мероприятие
        userId
          ? prisma.eventRegistration.findFirst({
              where: { userId, eventId: event.id },
            })
          : Promise.resolve(null),
        // Лайки (количество и статус)
        Promise.all([
          prisma.like.count({ where: { eventId: event.id } }),
          userId
            ? prisma.like.findFirst({
                where: { userId, eventId: event.id },
              })
            : Promise.resolve(null),
        ]),
      ],
    );

    const isFavorite = !!favoriteResult;
    const isRegistered = !!registrationResult;
    const likesCount = likesResult[0];
    const isLiked = !!likesResult[1];

    const feedItem: FeedItem = {
      id: event.id,
      type: "EVENT",
      title: event.title,
      slug: event.slug,
      description: event.description,
      coverImage: event.coverImage,
      date: event.startDate,
      author: event.author,
      format: event.format,
      eventType: event.type as EventType | null,
      city: event.city,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      registrationsCount: event._count.registrations,
      isFavorite,
      isLiked,
      likesCount,
      viewsCount: 0, // События пока без просмотров
      isAuthor: userId === event.authorId,
      isRegistered,
    };

    return {
      success: true,
      data: feedItem,
    };
  } catch (error) {
    console.error("Error fetching published event:", error);
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Не удалось загрузить мероприятие",
      },
    };
  }
}
