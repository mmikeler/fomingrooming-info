"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/errors/result";

export interface PublishedEvent {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  format: "ONLINE" | "OFFLINE";
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
  city?: string | null;
  dateFilter?: "upcoming" | "past" | "all" | null;
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
    const { cursor, limit = 6, format, city, dateFilter, search } = params;

    // Построение условий where
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    // Фильтр по формату
    if (format) {
      where.format = format;
    }

    // Фильтр по городу
    if (city) {
      where.city = city;
    }

    // Фильтр по дате
    if (dateFilter === "upcoming") {
      where.startDate = {
        gte: new Date(),
      };
    } else if (dateFilter === "past") {
      where.endDate = {
        lt: new Date(),
      };
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
