"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

export interface WidgetEvent {
  id: number;
  title: string;
  slug: string;
  city: string | null;
  location: string | null;
  startDate: Date;
  coverImage: string | null;
}

const DEFAULT_CITY = "Москва";
const REQUIRED_EVENTS_COUNT = 3;

/**
 * Получить ближайшие мероприятия для виджета
 * Приоритет: город пользователя -> Москва -> любые ближайшие
 */
export async function getNearestEventsForWidget(): Promise<WidgetEvent[]> {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);

    // Определяем город пользователя
    let userCity: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { city: true },
      });
      userCity = user?.city || null;
    }

    // Используем город пользователя или Москва по умолчанию
    const targetCity = userCity || DEFAULT_CITY;
    const now = new Date();

    // Сначала пытаемся получить мероприятия из целевого города
    const cityEvents = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        city: targetCity,
        startDate: {
          gte: now,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        city: true,
        location: true,
        startDate: true,
        coverImage: true,
      },
      orderBy: {
        startDate: "asc",
      },
      take: REQUIRED_EVENTS_COUNT,
    });

    // Если достаточно мероприятий в городе пользователя/Москве
    if (cityEvents.length >= REQUIRED_EVENTS_COUNT) {
      return cityEvents as WidgetEvent[];
    }

    // Если мероприятий недостаточно, добираем из других городов
    const remainingCount = REQUIRED_EVENTS_COUNT - cityEvents.length;

    // Получаем ID уже полученных мероприятий
    const existingIds = cityEvents.map((e) => e.id);

    const otherCityEvents = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        startDate: {
          gte: now,
        },
        // Исключаем уже полученные мероприятия и мероприятия из целевого города
        NOT: [{ id: { in: existingIds } }, { city: targetCity }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        city: true,
        location: true,
        startDate: true,
        coverImage: true,
      },
      orderBy: {
        startDate: "asc",
      },
      take: remainingCount,
    });

    // Объединяем результаты
    return [...cityEvents, ...otherCityEvents] as WidgetEvent[];
  } catch (error) {
    logger.error("Error fetching nearest events for widget:", error);
    return [];
  }
}
