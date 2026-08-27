// Post Category Labels

import { PostCategory } from "@/generated/prisma/enums";

export const postCategoryOptions = [
  { value: PostCategory.NEWS, label: "Новость" },
  { value: PostCategory.ARTICLE, label: "Статья" },
  { value: PostCategory.NOTES, label: "Заметка" },
  { value: PostCategory.EXPERT, label: "Мнение эксперта" },
];

export const getPostCategoryLabel = (category: PostCategory) => {
  return (
    postCategoryOptions.find((item) => item.value === category)?.label || ""
  );
};
