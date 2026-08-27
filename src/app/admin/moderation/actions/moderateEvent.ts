"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  action,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { canModerate } from "@/lib/permissions";
import { EventStatus } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

interface ModeratedEvent {
  id: number;
  title: string;
  status: EventStatus;
}

interface ModerationLogEntry {
  id: number;
  eventId: number;
  moderatorId: number;
  oldStatus: EventStatus;
  newStatus: EventStatus;
  reason: string | null;
  createdAt: Date;
}

// Для мероприятий используем EventStatus вместо PostStatus
type StatusType = EventStatus;

/**
 * Получение мероприятий на модерации
 */
export async function getPendingEvents() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return [];
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user || !canModerate(user.role)) {
      return [];
    }

    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.PENDING,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created: "asc",
      },
    });

    return events;
  } catch (error) {
    logger.error("Failed to get pending events", { error });
    return [];
  }
}

/**
 * Одобрение мероприятия
 */
export async function approveEvent(
  eventId: number,
): Promise<ActionResult<ModeratedEvent>> {
  return action(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user || !canModerate(user.role)) {
      throw new ForbiddenError("Недостаточно прав для модерации");
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError("Мероприятие", eventId);
    }

    if (event.status !== EventStatus.PENDING) {
      throw new Error("Мероприятие не находится на модерации");
    }

    // Обновляем мероприятие и создаём лог в транзакции
    const result = await prisma.$transaction([
      prisma.event.update({
        where: { id: eventId },
        data: {
          status: EventStatus.PUBLISHED,
          moderatedAt: new Date(),
          moderatedBy: user.id,
          rejectionReason: null,
        },
        select: {
          id: true,
          title: true,
          status: true,
        },
      }),
      prisma.moderationLog.create({
        data: {
          eventId,
          moderatorId: user.id,
          oldStatus: event.status,
          newStatus: EventStatus.PUBLISHED,
        },
      }),
    ]);

    logger.info("Event approved", {
      eventId,
      moderatorId: user.id,
    });

    revalidatePath("/moderation");
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);

    return result[0];
  });
}

/**
 * Отклонение мероприятия
 */
export async function rejectEvent(
  eventId: number,
  reason: string,
): Promise<ActionResult<ModeratedEvent>> {
  return action(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user || !canModerate(user.role)) {
      throw new ForbiddenError("Недостаточно прав для модерации");
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError("Мероприятие", eventId);
    }

    if (event.status !== EventStatus.PENDING) {
      throw new Error("Мероприятие не находится на модерации");
    }

    if (!reason.trim()) {
      throw new Error("Необходимо указать причину отклонения");
    }

    // Обновляем мероприятие и создаём лог в транзакции
    const result = await prisma.$transaction([
      prisma.event.update({
        where: { id: eventId },
        data: {
          status: EventStatus.REJECTED,
          rejectionReason: reason,
          moderatedAt: new Date(),
          moderatedBy: user.id,
        },
        select: {
          id: true,
          title: true,
          status: true,
        },
      }),
      prisma.moderationLog.create({
        data: {
          eventId,
          moderatorId: user.id,
          oldStatus: event.status,
          newStatus: EventStatus.REJECTED,
          reason: reason,
        },
      }),
    ]);

    logger.info("Event rejected", {
      eventId,
      moderatorId: user.id,
      reason,
    });

    revalidatePath("/moderation");

    return result[0];
  });
}

/**
 * Получение истории модерации мероприятия
 */
export async function getEventModerationHistory(eventId: number): Promise<
  {
    id: number;
    eventId: number;
    moderatorId: number;
    oldStatus: StatusType;
    newStatus: StatusType;
    reason: string | null;
    createdAt: Date;
    moderator: {
      id: number;
      name: string;
    };
  }[]
> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return [];
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user || !canModerate(user.role)) {
      return [];
    }

    // Для мероприятий пока нет отдельной таблицы логов, возвращаем пустой массив
    // Можно расширить схему при необходимости
    return [];
  } catch (error) {
    logger.error("Failed to get event moderation history", { error, eventId });
    return [];
  }
}
