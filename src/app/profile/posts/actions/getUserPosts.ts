"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@/generated/prisma/enums";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  created: Date;
  status: PostStatus;
  rejectionReason: string | null;
  authorId: number;
}

/**
 * Получение списка постов текущего пользователя
 */
export async function getUserPosts(): Promise<ActionResult<Post[]>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Получение постов
    return prisma.post.findMany({
      where: { authorId: parseInt(session.user.id) },
      orderBy: { id: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        created: true,
        status: true,
        rejectionReason: true,
        authorId: true,
      },
    });
  });
}
