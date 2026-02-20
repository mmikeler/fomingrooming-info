import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerate } from "@/lib/permissions";
import { ModerationQueue } from "./components/ModerationQueue";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Модерация постов</h1>

      {pendingPosts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            Нет постов, ожидающих модерации
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-gray-600">
            Постов на модерации: {pendingPosts.length}
          </p>
        </div>
      )}

      <ModerationQueue posts={pendingPosts} />
    </div>
  );
}
