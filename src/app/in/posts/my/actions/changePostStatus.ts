// Change post status server action

"use server";

import { PostStatus } from "@/generated/prisma/enums";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isNumber } from "lodash";
import { getServerSession } from "next-auth";

export async function changePostStatus(
  postId: number | string,
  status: PostStatus,
): Promise<{ error?: string; success?: boolean }> {
  // Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session) return { error: "You are not logged in" };

  // Check if user is admin
  const isAdmin = session.user.role.match(/ADMIN/);

  // Adapt ID
  const id = isNumber(postId) ? postId : parseInt(postId);

  // Try to update post status
  try {
    const prev = await prisma.post.findUnique({
      where: { id },
      select: { status: true },
    });

    // Check if post exists
    if (!prev) return { error: "Post not found" };

    //const isDraft = prev.status === PostStatus.DRAFT;
    const isPending = prev.status === PostStatus.PENDING;
    //const isPublished = prev.status === PostStatus.PUBLISHED;
    //const isRejected = prev.status === PostStatus.REJECTED;
    //const isArchived = prev.status === PostStatus.ARCHIVED;

    // Check if status is already set
    if (prev.status === status) return { error: "Post status is already set" };

    // Если пост в статусе PENDING, то только админ может его изменить
    if (isPending && !isAdmin) return { error: "Нельзя в текущем статусе" };

    // Update post status
    await prisma.post.update({
      where: { id },
      data: { status },
    });

    return { success: true };
  } catch {
    return { error: "Не удалось обновить статус поста" };
  }
}
