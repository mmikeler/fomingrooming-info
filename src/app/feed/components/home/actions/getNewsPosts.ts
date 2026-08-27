"use server";

import { action, ActionResult } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { PostCategory, PostStatus } from "@/generated/prisma/enums";

export interface NewsPost {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  created: Date;
}

/**
 * Получение опубликованных постов по категориям
 * @param categories - массив категорий для фильтрации (по умолчанию ["NEWS"])
 * @param count - количество постов (по умолчанию 8)
 */
export async function getNewsPosts(
  categories: string[] = ["NEWS"],
  count: number = 8,
): Promise<ActionResult<NewsPost[]>> {
  return action(async () => {
    // Фильтруем только допустимые категории
    const validCategories = categories
      .filter((cat) => cat === "NEWS" || cat === "ARTICLE")
      .map((cat) => cat as PostCategory);

    // Если нет допустимых категорий, используем NEWS по умолчанию
    const postCategories =
      validCategories.length > 0 ? validCategories : [PostCategory.NEWS];

    return prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        category: {
          in: postCategories,
        },
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
      },
    });
  });
}
