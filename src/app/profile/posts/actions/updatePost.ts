"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePost(
  id: number,
  data: { title?: string; published?: boolean; content?: string },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const post = await prisma.post.findFirst({
      where: {
        id,
        authorId: parseInt(session.user.id),
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    await prisma.post.update({
      where: { id },
      data: {
        title: data.title || post.title,
        content: data.content || post.content,
        published: data.published || post.published,
      },
    });

    revalidatePath("/profile/posts");
  } catch (error) {
    console.error("Error updating post:", error);
    throw new Error("Failed to update post");
  }
}
