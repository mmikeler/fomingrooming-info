import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerate } from "@/lib/permissions";
import { ModerationQueue } from "./components/ModerationQueue";
import { EventsModerationQueue } from "./components/EventsModerationQueue";

export default async function ModerationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  });

  if (!user || !canModerate(user.role)) {
    redirect("/profile");
  }

  // Получаем посты на модерации
  const pendingPosts = await prisma.post.findMany({
    where: {
      status: "PENDING",
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

  // Получаем мероприятия на модерации
  const pendingEvents = await prisma.event.findMany({
    where: {
      status: "PENDING",
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

  const totalItems = pendingPosts.length + pendingEvents.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Модерация</h1>

      {totalItems === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            Нет материалов, ожидающих модерации
          </p>
        </div>
      ) : (
        <>
          {pendingPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Посты на модерации ({pendingPosts.length})
              </h2>
              <ModerationQueue posts={pendingPosts} />
            </div>
          )}

          {pendingEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold">
                Мероприятия на модерации ({pendingEvents.length})
              </h2>
              <EventsModerationQueue events={pendingEvents} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
