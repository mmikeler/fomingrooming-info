"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  action,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@/generated/prisma/enums";
import { canCreateContent } from "@/lib/permissions";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  coverImage: string | null;
  status: PostStatus;
  category: "NEWS" | "ARTICLE";
  rejectionReason: string | null;
  authorId: number;
}

/**
 * Получение поста по ID для редактирования
 */
export async function getPostById(id: number): Promise<ActionResult<Post>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Проверка статуса аккаунта
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { status: true },
    });

    if (!user || !canCreateContent(user.status)) {
      throw new ForbiddenError(
        "Ваш аккаунт ограничен. Вы не можете редактировать посты.",
      );
    }

    // Поиск поста с проверкой владельца
    const post = await prisma.post.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!post) {
      throw new NotFoundError("Пост", id);
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      coverImage: post.coverImage,
      status: post.status,
      category: post.category,
      rejectionReason: post.rejectionReason,
      authorId: post.authorId,
    };
  });
}
