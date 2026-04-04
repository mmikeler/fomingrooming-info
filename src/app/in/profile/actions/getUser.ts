"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function getUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        phone: true,
        role: true,
        avatar: true,
        slug: true,
        showContacts: true,
      },
    });

    return user;
  } catch (error) {
    logger.error("Error fetching user:", error);
    return null;
  }
}
