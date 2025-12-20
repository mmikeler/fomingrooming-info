"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserPosts() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const posts = await prisma.post.findMany({
    where: { authorId: parseInt(session.user.id) },
    orderBy: { id: "desc" },
  });

  return posts;
}
