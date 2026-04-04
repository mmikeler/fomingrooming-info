"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { canCreateContent } from "@/lib/permissions";
import type { PostStatus, PostCategory } from "@/generated/prisma/enums";

/**
 * Интерфейс поста пользователя
 */
export interface UserPost {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  content: string | null;
  category: PostCategory;
  status: PostStatus;
  rejectionReason: string | null;
  created: Date;
}

/**
 * Параметры фильтрации постов
 */
export interface PostFilters {
  status: PostStatus | null;
  category: PostCategory | null;
  search: string | null;
}

/**
 * Параметры запроса постов
 */
export interface GetUserPostsParams {
  cursor?: number | null;
  limit?: number;
  filters?: PostFilters;
}

/**
 * Результат запроса постов
 */
export interface GetUserPostsResult {
  posts: UserPost[];
  nextCursor: number | null;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Получение постов текущего пользователя с фильтрацией
 */
export async function getUserPosts(
  params: GetUserPostsParams = {},
): Promise<ActionResult<GetUserPostsResult>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const userId = parseInt(session.user.id);

    // Проверка статуса аккаунта
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user || !canCreateContent(user.status)) {
      throw new ForbiddenError(
        "Ваш аккаунт ограничен. Вы не можете управлять постами.",
      );
    }

    const { cursor = null, limit = 10, filters } = params;

    // Построение where-conditions
    const whereConditions: {
      authorId: number;
      status?: PostStatus;
      category?: PostCategory;
      OR?: Array<{
        title?: { contains: string };
        content?: { contains: string };
      }>;
    } = {
      authorId: userId,
    };

    if (filters?.status) {
      whereConditions.status = filters.status;
    }

    if (filters?.category) {
      whereConditions.category = filters.category;
    }

    if (filters?.search) {
      whereConditions.OR = [
        { title: { contains: filters.search } },
        { content: { contains: filters.search } },
      ];
    }

    // Получаем общее количество постов
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
        status: true,
        rejectionReason: true,
        created: true,
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
