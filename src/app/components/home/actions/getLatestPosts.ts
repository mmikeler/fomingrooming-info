"use server";

import { action, ActionResult } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@/generated/prisma/enums";

export interface LatestPost {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  created: Date;
  author: {
    name: string;
  };
}

/**
 * Получение последних опубликованных постов
 * @param count - количество постов (по умолчанию 2)
 */
export async function getLatestPosts(
  count: number = 2,
): Promise<ActionResult<LatestPost[]>> {
  return action(async () => {
    return prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      orderBy: {
        created: "desc",
      },
      take: count,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        created: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });
  });
}
