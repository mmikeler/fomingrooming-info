"use server";

import { prisma } from "@/lib/prisma";
import { action, ActionResult } from "@/lib/errors";
import { PostStatus } from "@/generated/prisma/enums";
import type { PostCategory } from "@/generated/prisma/enums";

/**
 * Интерфейс опубликованного поста
 */
export interface PublishedPost {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  content: string | null;
  category: PostCategory;
  created: Date;
  author: {
    id: number;
    name: string;
    slug: string;
    avatar: string | null;
  };
}

/**
 * Параметры фильтрации постов
 */
export interface PublishedPostFilters {
  category: PostCategory | null;
  search: string | null;
}

/**
 * Параметры запроса постов
 */
export interface GetPublishedPostsParams {
  cursor?: number | null;
  limit?: number;
  filters?: PublishedPostFilters;
}

/**
 * Результат запроса постов
 */
export interface GetPublishedPostsResult {
  posts: PublishedPost[];
  nextCursor: number | null;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Получение всех опубликованных постов с фильтрацией
 * Доступно всем пользователям (включая неавторизованных)
 */
export async function getPublishedPosts(
  params: GetPublishedPostsParams = {},
): Promise<ActionResult<GetPublishedPostsResult>> {
  return action(async () => {
    const { cursor = null, limit = 10, filters } = params;

    // Построение where-conditions
    const whereConditions: {
      status: PostStatus;
      category?: PostCategory;
      OR?: Array<{
        title?: { contains: string };
        content?: { contains: string };
      }>;
    } = {
      status: PostStatus.PUBLISHED,
    };

    if (filters?.category) {
      whereConditions.category = filters.category;
    }

    if (filters?.search) {
      whereConditions.OR = [
        { title: { contains: filters.search } },
        { content: { contains: filters.search } },
      ];
    }

    // Получаем общее количество опубликованных постов
    const totalCount = await prisma.post.count({
      where: whereConditions,
    });

    // Получаем посты
    const posts = await prisma.post.findMany({
      where: whereConditions,
      orderBy: {
        created: "desc",
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        content: true,
        category: true,
        created: true,
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

    // Проверяем есть ли еще посты
    const hasMore = posts.length > limit;
    const resultPosts = hasMore ? posts.slice(0, limit) : posts;

    // nextCursor - ID последнего элемента для следующей страницы
    const nextCursor = hasMore ? resultPosts[resultPosts.length - 1].id : null;

    return {
      posts: resultPosts,
      nextCursor,
      hasMore,
      totalCount,
    };
  });
}
