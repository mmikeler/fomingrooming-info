"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const post = await prisma.post.create({
      data: {
        title: "Новый пост",
        content: null,
        published: false,
        authorId: parseInt(session.user.id),
      },
    });

    revalidatePath("/profile/posts");

    return post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}
