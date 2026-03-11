"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { canPublishDirectly } from "@/lib/permissions";
import { PostStatus } from "@/generated/prisma/enums";
import { generateUniqueSlug } from "./checkSlug";
import { checkAuthRateLimit } from "@/lib/rate-limit";

interface CreatedPost {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  status: PostStatus;
  authorId: number;
}

/**
 * Создание нового поста
 * Пост создаётся как черновик (DRAFT)
 */
export async function createPost(): Promise<ActionResult<CreatedPost>> {
  // Применяем rate limiting для защиты от спама
  const rateLimit = await checkAuthRateLimit("createPost");

  if (rateLimit.success === false) {
    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: rateLimit.error.message,
        details: {},
      },
    };
  }

  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация для создания поста");
    }

    // Генерация уникального slug
    const slugResult = await generateUniqueSlug("Новый пост");
    if (!slugResult.success) {
      throw new Error("Ошибка при генерации slug");
    }

    // Создание поста как черновика
    const post = await prisma.post.create({
      data: {
        title: "Новый пост",
        slug: slugResult.data,
        content: null,
        status: PostStatus.DRAFT,
        authorId: parseInt(session.user.id),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        authorId: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/posts");

    return post;
  });
}
