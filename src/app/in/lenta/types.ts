/**
 * Общие типы для ленты (посты и события)
 */

import type {
  PostCategory,
  EventFormat,
  EventType,
} from "@/generated/prisma/enums";

/** Тип элемента ленты */
export type FeedItemType = "POST" | "EVENT";

/**
 * FeedItem - унифицированный формат для постов и мероприятий в ленте
 * Используется для отображения контента в едином формате
 */
export interface FeedItem {
  id: number;
  type: FeedItemType;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  date: Date;
  author: {
    id: number;
    name: string;
    slug: string;
    avatar: string | null;
  };
  // Для постов
  content?: string | null;
  category?: PostCategory;
  // Для событий
  format?: EventFormat;
  eventType?: EventType | null;
  city?: string | null;
  location?: string | null;
  startDate?: Date;
  endDate?: Date;
  registrationsCount?: number;
  // Избранное
  isFavorite: boolean;
  // Лайки
  isLiked: boolean;
  likesCount: number;
  // Просмотры
  viewsCount: number;
  // Автор
  isAuthor: boolean;
  // Регистрация на мероприятие (только для EVENT)
  isRegistered?: boolean;
}

/** Типы фильтров ленты */
export type FeedFilterType = "ALL" | "EVENT" | "NEWS" | "ARTICLE";

/** Параметры для получения элементов ленты */
export interface GetFeedItemsParams {
  /** Курсор для пагинации (дата последнего элемента) */
  cursor?: string; // ISO date string
  limit?: number;
  filter?: FeedFilterType;
}

/** Результат получения элементов ленты */
export interface GetFeedItemsResult {
  items: FeedItem[];
  nextCursor: string | null; // ISO date string
  hasMore: boolean;
  totalCount: number;
}

/** Параметры для получения одного элемента ленты */
export interface GetFeedItemParams {
  /** ID или slug поста/мероприятия */
  idOrSlug: string;
  /** Тип элемента - если не указан, определяется автоматически */
  type?: "POST" | "EVENT";
}
