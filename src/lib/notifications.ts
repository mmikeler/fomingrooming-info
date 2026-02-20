"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Создание уведомления для пользователя
 */
export async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: string,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    logger.info("Notification created", {
      userId,
      type,
      title,
    });
  } catch (error) {
    logger.error("Failed to create notification", {
      error,
      userId,
      title,
    });
  }
}

/**
 * Получение уведомлений текущего пользователя
 */
export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return [];
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: parseInt(session.user.id),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return notifications;
  } catch (error) {
    logger.error("Failed to get notifications", { error });
    return [];
  }
}

/**
 * Подсчёт непрочитанных уведомлений
 */
export async function getUnreadCount() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return 0;
    }

    const count = await prisma.notification.count({
      where: {
        userId: parseInt(session.user.id),
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    logger.error("Failed to get unread count", { error });
    return 0;
  }
}

/**
 * Отметить уведомление как прочитанное
 */
export async function markAsRead(notificationId: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: parseInt(session.user.id),
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    logger.error("Failed to mark notification as read", {
      error,
      notificationId,
    });
    return { success: false, error: "Ошибка при обновлении" };
  }
}

/**
 * Отметить все уведомления как прочитанные
 */
export async function markAllAsRead() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    await prisma.notification.updateMany({
      where: {
        userId: parseInt(session.user.id),
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    logger.error("Failed to mark all notifications as read", { error });
    return { success: false, error: "Ошибка при обновлении" };
  }
}

/**
 * Отправка уведомления о результате модерации
 */
export async function sendModerationNotification(
  authorId: number,
  postTitle: string,
  approved: boolean,
  reason?: string,
) {
  const title = approved ? "Пост одобрен" : "Пост отклонён";

  const message = approved
    ? `Ваш пост "${postTitle}" был одобрен и опубликован.`
    : `Ваш пост "${postTitle}" был отклонён.${reason ? ` Причина: ${reason}` : ""}`;

  await createNotification(
    authorId,
    title,
    message,
    approved ? "POST_APPROVED" : "POST_REJECTED",
  );
}
