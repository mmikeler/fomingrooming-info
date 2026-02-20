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
import { PostStatus } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

interface ModeratedPost {
  id: number;
  title: string;
  status: PostStatus;
}

interface ModerationLogEntry {
  id: number;
  postId: number;
  moderatorId: number;
  oldStatus: PostStatus;
  newStatus: PostStatus;
  reason: string | null;
  createdAt: Date;
}

/**
 * Получение постов на модерации
 */
export async function getPendingPosts() {
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

    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PENDING,
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

    return posts;
  } catch (error) {
    logger.error("Failed to get pending posts", { error });
    return [];
  }
}

/**
 * Одобрение поста
 */
export async function approvePost(
  postId: number,
): Promise<ActionResult<ModeratedPost>> {
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError("Пост", postId);
    }

    if (post.status !== PostStatus.PENDING) {
      throw new Error("Пост не находится на модерации");
    }

    // Обновляем пост и создаём лог в транзакции
    const result = await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.PUBLISHED,
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
          postId,
          moderatorId: user.id,
          oldStatus: post.status,
          newStatus: PostStatus.PUBLISHED,
        },
      }),
    ]);

    logger.info("Post approved", {
      postId,
      moderatorId: user.id,
    });

    revalidatePath("/moderation");
    revalidatePath("/blog");
    revalidatePath(`/blog/${postId}`);

    return result[0];
  });
}

/**
 * Отклонение поста
 */
export async function rejectPost(
  postId: number,
  reason: string,
): Promise<ActionResult<ModeratedPost>> {
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError("Пост", postId);
    }

    if (post.status !== PostStatus.PENDING) {
      throw new Error("Пост не находится на модерации");
    }

    if (!reason.trim()) {
      throw new Error("Необходимо указать причину отклонения");
    }

    // Обновляем пост и создаём лог в транзакции
    const result = await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.REJECTED,
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
          postId,
          moderatorId: user.id,
          oldStatus: post.status,
          newStatus: PostStatus.REJECTED,
          reason,
        },
      }),
    ]);

    logger.info("Post rejected", {
      postId,
      moderatorId: user.id,
      reason,
    });

    revalidatePath("/moderation");

    return result[0];
  });
}

/**
 * Получение истории модерации поста
 */
export async function getModerationHistory(
  postId: number,
): Promise<ModerationLogEntry[]> {
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

    const logs = await prisma.moderationLog.findMany({
      where: { postId },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return logs;
  } catch (error) {
    logger.error("Failed to get moderation history", { error, postId });
    return [];
  }
}
