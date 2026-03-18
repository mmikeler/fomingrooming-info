"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/errors/result";
import type { EventType } from "@/generated/prisma/enums";

export interface PublishedEvent {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  format: "ONLINE" | "OFFLINE";
  type: EventType | null;
  city: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  author: {
    id: number;
    name: string;
    slug: string;
    avatar: string | null;
  };
  _count: {
    registrations: number;
  };
}

export interface GetPublishedEventsParams {
  cursor?: number;
  limit?: number;
  format?: "ONLINE" | "OFFLINE" | null;
  type?: EventType | null;
  city?: string | null;
  dateFilter?: "upcoming" | "past" | "all" | null;
  dateRange?: { start: string | null; end: string | null } | null;
  search?: string | null;
}

export interface GetPublishedEventsResult {
  events: PublishedEvent[];
  nextCursor: number | null;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Получить список уникальных городов из опубликованных мероприятий
 */
export async function getEventCities(): Promise<ActionResult<string[]>> {
  try {
    const cities = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        city: {
          not: null,
        },
      },
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    });

    return {
      success: true,
      data: cities
        .map((c) => c.city)
        .filter((city): city is string => city !== null),
    };
  } catch (error) {
    console.error("Error fetching event cities:", error);
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Не удалось загрузить список городов",
      },
    };
  }
}

export async function getPublishedEvents(
  params: GetPublishedEventsParams = {},
): Promise<ActionResult<GetPublishedEventsResult>> {
  try {
    const {
      cursor,
      limit = 6,
      format,
      type,
      city,
      dateFilter,
      dateRange,
      search,
    } = params;

    // Построение условий where
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    // Фильтр по формату
    if (format) {
      where.format = format;
    }

    // Фильтр по типу
    if (type) {
      where.type = type;
    }

    // Фильтр по городу
    if (city) {
      where.city = city;
    }

    // Поиск по названию и описанию
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }

    // Фильтры по дате - собираем все условия в AND
    const dateConditions: Record<string, unknown>[] = [];

    // Фильтр по диапазону дат
    if (dateRange) {
      const { start, end } = dateRange;
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;

      if (startDate && endDate) {
        // Оба диапазона указаны - мероприятие должно пересекаться с диапазоном
        dateConditions.push({
          startDate: {
            lte: endDate,
          },
        });
        dateConditions.push({
          endDate: {
            gte: startDate,
          },
        });
      } else if (startDate) {
        // Указана только начальная дата - мероприятие заканчивается после указанной даты
        dateConditions.push({
          endDate: {
            gte: startDate,
          },
        });
      } else if (endDate) {
        // Указана только конечная дата - мероприятие начинается до указанной даты
        dateConditions.push({
          startDate: {
            lte: endDate,
          },
        });
      }
    }

    // Фильтр по времени (предстоящие/прошедшие)
    if (dateFilter === "upcoming") {
      dateConditions.push({
        startDate: {
          gte: new Date(),
        },
      });
    } else if (dateFilter === "past") {
      dateConditions.push({
        endDate: {
          lt: new Date(),
        },
      });
    }

    // Применяем все условия даты через AND
    if (dateConditions.length > 0) {
      where.AND = dateConditions;
    }

    // Получаем общее количество (для информативности)
    const totalCount = await prisma.event.count({ where });

    const events = await prisma.event.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = events.length > limit;
    const resultEvents = hasMore ? events.slice(0, -1) : events;
    const nextCursor = hasMore
      ? resultEvents[resultEvents.length - 1].id
      : null;

    return {
      success: true,
      data: {
        events: resultEvents as PublishedEvent[],
        nextCursor,
        hasMore,
        totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching published events:", error);
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Не удалось загрузить мероприятия",
      },
    };
  }
}
