import { PostStatus } from "@/generated/prisma/enums";

/**
 * Получение списка статусов постов
 */
export function getPostStatuses(): { value: PostStatus; label: string }[] {
  return [
    { value: "DRAFT", label: "Черновик" },
    { value: "PENDING", label: "На модерации" },
    { value: "PUBLISHED", label: "Опубликовано" },
    { value: "REJECTED", label: "Отклонено" },
    { value: "ARCHIVED", label: "В архиве" },
  ];
}
