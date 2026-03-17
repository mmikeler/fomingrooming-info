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
  ForbiddenError,
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { canPublishDirectly, canCreateContent } from "@/lib/permissions";
import { EventStatus } from "@/generated/prisma/enums";
import { validateSlug } from "@/lib/slug";
import { generateEventUniqueSlug } from "./checkEventSlug";

interface UpdateEventData {
  title?: string;
  slug?: string;
  description?: string | null;
  format?: "ONLINE" | "OFFLINE";
  city?: string | null;
  location?: string | null;
  startDate?: Date;
  endDate?: Date;
  coverImage?: string | null;
}

interface UpdatedEvent {
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
  status: EventStatus;
}

/**
 * Обновление мероприятия (только для черновиков и отклонённых мероприятий)
 */
export async function updateEvent(
  id: number,
  data: UpdateEventData,
): Promise<ActionResult<UpdatedEvent>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Проверка статуса аккаунта
    const userCheck = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { status: true },
    });

    if (!userCheck || !canCreateContent(userCheck.status)) {
      throw new ForbiddenError(
        "Ваш аккаунт ограничен. Вы не можете редактировать мероприятия.",
      );
    }

    // Поиск мероприятия с проверкой владельца
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingEvent) {
      throw new NotFoundError("Мероприятие", id);
    }

    // Проверка: можно редактировать только черновики и отклонённые мероприятия
    if (
      existingEvent.status !== EventStatus.DRAFT &&
      existingEvent.status !== EventStatus.REJECTED
    ) {
      throw new BadRequestError(
        "Нельзя редактировать мероприятие в текущем статусе",
      );
    }

    // Определяем новый slug
    let newSlug = existingEvent.slug;

    if (data.slug !== undefined) {
      // Если slug передан явно — валидируем и используем
      if (!validateSlug(data.slug)) {
        throw new BadRequestError(
          "Slug должен содержать только латинские буквы, цифры и дефисы, длина 3-200 символов",
        );
      }
      // Проверяем уникальность slug
      const existingSlug = await prisma.event.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });
      if (existingSlug) {
        throw new BadRequestError("Мероприятие с таким slug уже существует");
      }
      newSlug = data.slug;
    } else if (data.title !== undefined && data.title !== existingEvent.title) {
      // Если изменился заголовок — генерируем новый slug
      const slugResult = await generateEventUniqueSlug(data.title, id);
      if (!slugResult.success) {
        throw new BadRequestError("Ошибка при генерации slug");
      }
      newSlug = slugResult.data;
    }

    // Обновление мероприятия
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: data.title ?? existingEvent.title,
        slug: newSlug,
        description:
          data.description !== undefined
            ? data.description
            : existingEvent.description,
        format: data.format ?? existingEvent.format,
        city: data.city !== undefined ? data.city : existingEvent.city,
        location:
          data.location !== undefined ? data.location : existingEvent.location,
        startDate: data.startDate ?? existingEvent.startDate,
        endDate: data.endDate ?? existingEvent.endDate,
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        format: true,
        city: true,
        location: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        status: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/events");

    return updatedEvent;
  });
}

/**
 * Отправка мероприятия на модерацию или публикация (для AUTHOR+)
 */
export async function submitEvent(
  id: number,
): Promise<ActionResult<UpdatedEvent>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Получаем пользователя для проверки роли
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user) {
      throw new UnauthorizedError("Пользователь не найден");
    }

    // Проверка статуса аккаунта
    if (!canCreateContent(user.status)) {
      throw new ForbiddenError(
        "Ваш аккаунт ограничен. Вы не можете публиковать мероприятия.",
      );
    }

    // Поиск мероприятия с проверкой владельца
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingEvent) {
      throw new NotFoundError("Мероприятие", id);
    }

    // Проверка: можно отправить только черновик или отклонённое мероприятие
    if (
      existingEvent.status !== EventStatus.DRAFT &&
      existingEvent.status !== EventStatus.REJECTED
    ) {
      throw new BadRequestError(
        "Нельзя отправить мероприятие в текущем статусе",
      );
    }

    // Определяем новый статус в зависимости от роли
    const newStatus = canPublishDirectly(user.role)
      ? EventStatus.PUBLISHED
      : EventStatus.PENDING;

    // Обновление мероприятия
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: newStatus,
        // Если публикуем напрямую, записываем информацию о модерации
        ...(newStatus === EventStatus.PUBLISHED && {
          moderatedAt: new Date(),
          moderatedBy: user.id,
        }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        format: true,
        city: true,
        location: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        status: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/events");
    revalidatePath("/moderation");

    return updatedEvent;
  });
}

/**
 * Архивация мероприятия
 */
export async function archiveEvent(
  id: number,
): Promise<ActionResult<UpdatedEvent>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Проверка статуса аккаунта
    const userCheck = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { status: true },
    });

    if (!userCheck || !canCreateContent(userCheck.status)) {
      throw new ForbiddenError("Ваш аккаунт ограничен.");
    }

    // Поиск мероприятия с проверкой владельца
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingEvent) {
      throw new NotFoundError("Мероприятие", id);
    }

    // Обновление статуса на ARCHIVED
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.ARCHIVED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        format: true,
        city: true,
        location: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        status: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/events");

    return updatedEvent;
  });
}

/**
 * Восстановление мероприятия из архива в черновики
 */
export async function restoreEvent(
  id: number,
): Promise<ActionResult<UpdatedEvent>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Проверка статуса аккаунта
    const userCheck = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { status: true },
    });

    if (!userCheck || !canCreateContent(userCheck.status)) {
      throw new ForbiddenError("Ваш аккаунт ограничен.");
    }

    // Поиск мероприятия с проверкой владельца
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingEvent) {
      throw new NotFoundError("Мероприятие", id);
    }

    // Проверка: можно восстановить только из архива
    if (existingEvent.status !== EventStatus.ARCHIVED) {
      throw new BadRequestError(
        "Можно восстановить только архивированное мероприятие",
      );
    }

    // Обновление статуса на DRAFT
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.DRAFT,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        format: true,
        city: true,
        location: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        status: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/events");

    return updatedEvent;
  });
}
