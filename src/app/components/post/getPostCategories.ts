import { PostCategory } from "@/generated/prisma/enums";

/**
 * Получение списка категорий постов
 */
export function getPostCategories(): { value: PostCategory; label: string }[] {
  return [
    { value: "NEWS", label: "Новость" },
    { value: "ARTICLE", label: "Статья" },
  ];
}
