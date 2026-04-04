import type { Metadata } from "next";
import type {
  PostCategory,
  EventFormat,
  EventType,
} from "@/generated/prisma/enums";

/**
 * Типы контента на сайте
 */
export type ContentType = "NEWS" | "ARTICLE" | "EVENT";

/**
 * Интерфейс данных поста для генерации метаданных
 */
export interface PostMetadataInput {
  title: string;
  description?: string | null;
  content?: string | null;
  coverImage?: string | null;
  slug: string;
  category?: PostCategory;
  author?: {
    name: string;
  };
  created?: Date;
  // Для событий
  format?: EventFormat;
  eventType?: EventType | null;
  city?: string | null;
  location?: string | null;
  startDate?: Date;
  endDate?: Date;
  registrationsCount?: number;
}

/**
 * Интерфейс для параметров генерации метаданных
 */
export interface GenerateMetadataParams {
  /** Данные контента */
  data: PostMetadataInput;
  /** Тип контента - если не указан, определяется автоматически */
  type?: ContentType;
  /** Базовый URL сайта */
  siteUrl?: string;
  /** Название сайта */
  siteName?: string;
}

/**
 * Карта категорий постов для отображения
 */
const CATEGORY_LABELS: Record<PostCategory, string> = {
  NEWS: "Новость",
  ARTICLE: "Статья",
};

/**
 * Карта типов мероприятий для отображения
 */
const EVENT_TYPE_LABELS: Record<EventType, string> = {
  MASTERCLASS: "Мастер-класс",
  SEMINAR: "Семинар",
  KONKURS: "Конкурс",
  LEKCIYA: "Лекция",
  VEBINAR: "Вебинар",
  AREA: "Мероприятие",
};

/**
 * Карта форматов мероприятий
 */
const EVENT_FORMAT_LABELS: Record<EventFormat, string> = {
  ONLINE: "Онлайн",
  OFFLINE: "Офлайн",
};

/**
 * Определить тип контента автоматически на основе данных
 */
export function determineContentType(data: PostMetadataInput): ContentType {
  if (data.startDate && data.endDate) {
    return "EVENT";
  }
  if (data.category === "ARTICLE") {
    return "ARTICLE";
  }
  return "NEWS";
}

/**
 * Извлечь изображение из Markdown контента
 */
function extractImageFromContent(content?: string | null): string | undefined {
  if (!content) return undefined;

  // Ищем первое изображение в формате ![alt](url)
  const imageMatch = content.match(/!\[.*?\]\((.+?)\)/);
  return imageMatch ? imageMatch[1] : undefined;
}

/**
 * Получить описание из контента или description
 */
function getDescription(
  description?: string | null,
  content?: string | null,
  maxLength = 160,
): string {
  if (description) return description.slice(0, maxLength);

  // Извлекаем текст из Markdown
  if (content) {
    // Удаляем изображения
    let text = content.replace(/!\[.*?\]\(.*?\)/g, "");
    // Удаляем ссылки, оставляя текст
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Удаляем форматирование
    text = text.replace(/[#*_`~]/g, "");
    // Удаляем переносы строк
    text = text.replace(/\n+/g, " ").trim();

    if (text.length > maxLength) {
      return text.slice(0, maxLength - 3) + "...";
    }
    return text;
  }

  return "";
}

/**
 * Форматировать дату в ISO строку
 */
function formatDate(date?: Date): string | undefined {
  if (!date) return undefined;
  return new Date(date).toISOString();
}

/**
 * Форматировать дату для locale
 */
function formatDateLocale(date?: Date): string | undefined {
  if (!date) return undefined;
  return new Date(date).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Формирует описание для мероприятия
 */
function buildEventDescription(
  baseDescription: string,
  data: PostMetadataInput,
): string {
  const parts: string[] = [];
  if (data.startDate) {
    parts.push(`📅 ${formatDateLocale(data.startDate)}`);
  }
  if (data.city || data.location) {
    parts.push(`📍 ${[data.city, data.location].filter(Boolean).join(", ")}`);
  }
  if (data.registrationsCount !== undefined) {
    parts.push(`👥 ${data.registrationsCount} участников`);
  }
  return parts.length > 0
    ? `${baseDescription}\n\n${parts.join("\n")}`
    : baseDescription;
}

/**
 * Генерировать базовые метаданные (общие для всех типов)
 */
function generateBaseMetadata(params: GenerateMetadataParams): {
  title: string;
  description: string;
  slug: string;
} {
  const { data, type } = params;

  // Формируем заголовок с указанием типа контента
  let title = data.title;
  if (type === "NEWS") {
    title = `Новость: ${data.title}`;
  } else if (type === "ARTICLE") {
    title = `Статья: ${data.title}`;
  } else if (type === "EVENT") {
    const eventTypeLabel = data.eventType
      ? EVENT_TYPE_LABELS[data.eventType]
      : "Мероприятие";
    title = `${eventTypeLabel}: ${data.title}`;
  }

  const description = getDescription(data.description, data.content);

  return {
    title,
    description,
    slug: data.slug,
  };
}

/**
 * Генерировать метаданные для новости (NEWS)
 */
function generateNewsMetadata(params: GenerateMetadataParams): Metadata {
  const {
    data,
    siteUrl = "https://fomingrooming.ru",
    siteName = "Формирование",
  } = params;

  const base = generateBaseMetadata({ ...params, type: "NEWS" });
  const image = data.coverImage || extractImageFromContent(data.content);
  const publishedTime = formatDate(data.created);
  const author = data.author?.name;
  const url = `${siteUrl}/s/${data.slug}`;

  return {
    title: data.title,
    description: base.description || undefined,
    openGraph: {
      title: data.title,
      description: base.description || undefined,
      type: "article",
      publishedTime,
      authors: author ? [author] : undefined,
      images: image ? [{ url: image }] : [],
      siteName,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: base.description || undefined,
      images: image ? [image] : [],
    },
    other: {
      "article:published_time": publishedTime || "",
      "article:author": author || "",
      "article:section": "Новости",
    },
  };
}

/**
 * Генерировать метаданные для статьи (ARTICLE)
 */
function generateArticleMetadata(params: GenerateMetadataParams): Metadata {
  const {
    data,
    siteUrl = "https://fomingrooming.ru",
    siteName = "Формирование",
  } = params;

  const base = generateBaseMetadata({ ...params, type: "ARTICLE" });
  const image = data.coverImage || extractImageFromContent(data.content);
  const publishedTime = formatDate(data.created);
  const author = data.author?.name;
  const url = `${siteUrl}/s/${data.slug}`;

  return {
    title: data.title,
    description: base.description || undefined,
    openGraph: {
      title: data.title,
      description: base.description || undefined,
      type: "article",
      publishedTime,
      authors: author ? [author] : undefined,
      images: image ? [{ url: image }] : [],
      siteName,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: base.description || undefined,
      images: image ? [image] : [],
    },
    other: {
      "article:published_time": publishedTime || "",
      "article:author": author || "",
      "article:section": "Статьи",
    },
  };
}

/**
 * Генерировать метаданные для мероприятия (EVENT)
 */
function generateEventMetadata(params: GenerateMetadataParams): Metadata {
  const {
    data,
    siteUrl = "https://fomingrooming.ru",
    siteName = "Формирование",
  } = params;

  // Формируем расширенный заголовок для мероприятия
  const eventTypeLabel = data.eventType
    ? EVENT_TYPE_LABELS[data.eventType]
    : "Мероприятие";
  const formatLabel = data.format ? EVENT_FORMAT_LABELS[data.format] : "";
  const title = formatLabel
    ? `${eventTypeLabel} (${formatLabel}): ${data.title}`
    : `${eventTypeLabel}: ${data.title}`;

  const base = generateBaseMetadata({ ...params, type: "EVENT" });
  const image = data.coverImage;
  const location = data.location || data.city || "";
  const eventDescription = buildEventDescription(base.description, data);
  const url = `${siteUrl}/s/${data.slug}`;

  return {
    title,
    description: eventDescription || undefined,
    openGraph: {
      title,
      description: base.description || undefined,
      type: "website",
      images: image ? [{ url: image }] : [],
      siteName,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: base.description || undefined,
      images: image ? [image] : [],
    },
    other: {
      "event:start_time": formatDate(data.startDate) || "",
      "event:end_time": formatDate(data.endDate) || "",
      "event:location": location,
      "event:format": data.format || "",
      "event:type": data.eventType || "",
    },
  };
}

/**
 * Основная функция генерации метаданных
 * Генерирует метаданные в зависимости от типа контента
 */
export function generateContentMetadata(
  params: GenerateMetadataParams,
): Metadata {
  const { data, type: explicitType } = params;

  // Определяем тип контента, если не указан явно
  const type = explicitType || determineContentType(data);

  switch (type) {
    case "NEWS":
      return generateNewsMetadata({ ...params, type: "NEWS" });
    case "ARTICLE":
      return generateArticleMetadata({ ...params, type: "ARTICLE" });
    case "EVENT":
      return generateEventMetadata({ ...params, type: "EVENT" });
    default:
      // Для неизвестных типов возвращаем базовые метаданные
      const base = generateBaseMetadata(params);
      return {
        title: base.title,
        description: base.description || undefined,
      };
  }
}

/**
 * Хелпер для создания канонического URL
 */
export function getCanonicalUrl(
  slug: string,
  baseUrl = "https://fomingrooming.ru",
): string {
  return `${baseUrl}/s/${slug}`;
}
