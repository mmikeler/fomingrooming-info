"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { action, UnauthorizedError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

interface Event {
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
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  rejectionReason: string | null;
  created: Date;
}

/**
 * Получение мероприятий текущего пользователя
 */
export async function getUserEvents(): Promise<ActionResult<Event[]>> {
  return action(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError("Необходима авторизация");
    }

    const events = await prisma.event.findMany({
      where: {
        authorId: parseInt(session.user.id),
      },
      orderBy: {
        created: "desc",
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
        rejectionReason: true,
        created: true,
      },
    });

    return events;
  });
}
