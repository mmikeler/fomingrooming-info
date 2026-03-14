"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  action,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { EventStatus } from "@/generated/prisma/enums";

interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: Date;
}

/**
 * Регистрация пользователя на мероприятие
 */
export async function registerForEvent(
  eventId: number,
): Promise<ActionResult<EventRegistration>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация для регистрации");
    }

    const userId = parseInt(session.user.id);

    // Поиск мероприятия
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError("Мероприятие", eventId);
    }

    // Проверка: мероприятие должно быть опубликовано
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestError(
        "Можно регистрироваться только на опубликованные мероприятия",
      );
    }

    // Проверка: нельзя регистрироваться на собственное мероприятие
    if (event.authorId === userId) {
      throw new BadRequestError(
        "Нельзя регистрироваться на собственное мероприятие",
      );
    }

    // Проверка: пользователь уже зарегистрирован
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      throw new ConflictError("Вы уже зарегистрированы на это мероприятие");
    }

    // Проверка: мероприятие ещё не началось
    if (new Date() > event.endDate) {
      throw new BadRequestError("Мероприятие уже завершилось");
    }

    // Создание регистрации
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
      },
      select: {
        id: true,
        eventId: true,
        userId: true,
        registeredAt: true,
      },
    });

    // Обновление кэша
    revalidatePath(`/events/${eventId}`);

    return registration;
  });
}

/**
 * Отмена регистрации пользователя на мероприятие
 */
export async function unregisterFromEvent(
  eventId: number,
): Promise<ActionResult<{ success: boolean }>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError(
        "Необходима авторизация для отмены регистрации",
      );
    }

    const userId = parseInt(session.user.id);

    // Поиск регистрации
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundError("Регистрация не найдена");
    }

    // Удаление регистрации
    await prisma.eventRegistration.delete({
      where: {
        id: registration.id,
      },
    });

    // Обновление кэша
    revalidatePath(`/events/${eventId}`);

    return { success: true };
  });
}

/**
 * Получение списка регистраций пользователя
 */
export async function getUserEventRegistrations(): Promise<
  ActionResult<
    Array<{
      id: number;
      eventId: number;
      event: {
        id: number;
        title: string;
        slug: string;
        startDate: Date;
        endDate: Date;
        status: EventStatus;
      };
      registeredAt: Date;
    }>
  >
> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId: parseInt(session.user.id),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    return registrations;
  });
}

/**
 * Получение списка зарегистрированных пользователей на мероприятие
 */
export async function getEventRegistrations(eventId: number): Promise<
  ActionResult<
    Array<{
      id: number;
      userId: number;
      user: {
        id: number;
        name: string;
        slug: string;
        avatar: string | null;
      };
      registeredAt: Date;
    }>
  >
> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Проверка: пользователь должен быть автором мероприятия или модератором
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        author: {
          select: { id: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundError("Мероприятие", eventId);
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    // Автор мероприятия или модератор может видеть список регистраций
    const isAuthor = event.authorId === parseInt(session.user.id);
    const { canModerate } = await import("@/lib/permissions");
    const isModerator = user && canModerate(user.role);

    if (!isAuthor && !isModerator) {
      throw new UnauthorizedError("Нет доступа к списку регистраций");
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        registeredAt: "asc",
      },
    });

    return registrations;
  });
}

/**
 * Проверка, зарегистрирован ли пользователь на мероприятие
 */
export async function checkUserRegistration(
  eventId: number,
): Promise<ActionResult<{ isRegistered: boolean }>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { isRegistered: false };
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: parseInt(session.user.id),
        },
      },
    });

    return { isRegistered: !!registration };
  });
}
