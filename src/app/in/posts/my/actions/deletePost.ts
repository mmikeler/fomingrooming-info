"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  action,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { PostStatus } from "@/generated/prisma/enums";

interface DeletedPost {
  id: number;
  title: string;
}

/**
 * Удаление поста
 * Проверяет, что удаляемый пост принадлежит текущему пользователю
 * Нельзя удалить опубликованный пост или пост на модерации
 */
export async function deletePost(
  id: number,
): Promise<ActionResult<DeletedPost>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация для удаления поста");
    }

    // Поиск поста
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        authorId: true,
        status: true,
      },
    });

    if (!existingPost) {
      throw new NotFoundError("Пост", id);
    }

    // Проверка, что текущий пользователь является автором поста
    if (existingPost.authorId !== parseInt(session.user.id)) {
      throw new ForbiddenError("Вы можете удалять только свои посты");
    }

    // Нельзя удалить опубликованный пост или пост на модерации
    if (
      existingPost.status === PostStatus.PUBLISHED ||
      existingPost.status === PostStatus.PENDING
    ) {
      throw new BadRequestError(
        "Нельзя удалить опубликованный пост или пост на модерации. Сначала архивируйте его.",
      );
    }

    // Удаление поста
    await prisma.post.delete({
      where: { id },
    });

    // Обновление кэша
    revalidatePath("/profile/posts");

    return {
      id: existingPost.id,
      title: existingPost.title,
    };
  });
}
