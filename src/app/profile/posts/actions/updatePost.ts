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
} from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { canPublishDirectly } from "@/lib/permissions";
import { PostStatus } from "@/generated/prisma/enums";
import { validateSlug, slugify } from "@/lib/slug";
import { checkSlugUniqueness, generateUniqueSlug } from "./checkSlug";

interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  coverImage?: string | null;
}

interface UpdatedPost {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  coverImage: string | null;
  status: PostStatus;
}

/**
 * Обновление поста (только для черновиков и отклонённых постов)
 */
export async function updatePost(
  id: number,
  data: UpdatePostData,
): Promise<ActionResult<UpdatedPost>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Поиск поста с проверкой владельца
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingPost) {
      throw new NotFoundError("Пост", id);
    }

    // Проверка: можно редактировать только черновики и отклонённые посты
    if (
      existingPost.status !== PostStatus.DRAFT &&
      existingPost.status !== PostStatus.REJECTED
    ) {
      throw new BadRequestError("Нельзя редактировать пост в текущем статусе");
    }

    // Определяем новый slug
    let newSlug = existingPost.slug;

    if (data.slug !== undefined) {
      // Если slug передан явно — валидируем и используем
      if (!validateSlug(data.slug)) {
        throw new BadRequestError(
          "Slug должен содержать только латинские буквы, цифры и дефисы, длина 3-200 символов",
        );
      }
      // Проверяем уникальность slug
      const existingSlug = await prisma.post.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });
      if (existingSlug) {
        throw new BadRequestError("Пост с таким slug уже существует");
      }
      newSlug = data.slug;
    } else if (data.title !== undefined && data.title !== existingPost.title) {
      // Если изменился заголовок — генерируем новый slug
      const slugResult = await generateUniqueSlug(data.title, id);
      if (!slugResult.success) {
        throw new BadRequestError("Ошибка при генерации slug");
      }
      newSlug = slugResult.data;
    }

    // Обновление поста
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title ?? existingPost.title,
        slug: newSlug,
        content: data.content ?? existingPost.content,
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        coverImage: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/posts");

    return updatedPost;
  });
}

/**
 * Отправка поста на модерацию или публикация (для AUTHOR+)
 */
export async function submitPost(
  id: number,
): Promise<ActionResult<UpdatedPost>> {
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

    // Поиск поста с проверкой владельца
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingPost) {
      throw new NotFoundError("Пост", id);
    }

    // Проверка: можно отправить только черновик или отклонённый пост
    if (
      existingPost.status !== PostStatus.DRAFT &&
      existingPost.status !== PostStatus.REJECTED
    ) {
      throw new BadRequestError("Нельзя отправить пост в текущем статусе");
    }

    // Определяем новый статус в зависимости от роли
    const newStatus = canPublishDirectly(user.role)
      ? PostStatus.PUBLISHED
      : PostStatus.PENDING;

    // Обновление поста
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: newStatus,
        // Если публикуем напрямую, записываем информацию о модерации
        ...(newStatus === PostStatus.PUBLISHED && {
          moderatedAt: new Date(),
          moderatedBy: user.id,
        }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        coverImage: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/posts");
    revalidatePath("/moderation");

    return updatedPost;
  });
}

/**
 * Архивация поста
 */
export async function archivePost(
  id: number,
): Promise<ActionResult<UpdatedPost>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Поиск поста с проверкой владельца
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingPost) {
      throw new NotFoundError("Пост", id);
    }

    // Обновление статуса на ARCHIVED
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.ARCHIVED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        coverImage: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/posts");

    return updatedPost;
  });
}

/**
 * Восстановление поста из архива в черновики
 */
export async function restorePost(
  id: number,
): Promise<ActionResult<UpdatedPost>> {
  return action(async () => {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    // Поиск поста с проверкой владельца
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!existingPost) {
      throw new NotFoundError("Пост", id);
    }

    // Проверка: можно восстановить только из архива
    if (existingPost.status !== PostStatus.ARCHIVED) {
      throw new BadRequestError(
        "Можно восстановить только архивированный пост",
      );
    }

    // Обновление статуса на DRAFT
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.DRAFT,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        coverImage: true,
      },
    });

    // Обновление кэша
    revalidatePath("/profile/posts");

    return updatedPost;
  });
}
