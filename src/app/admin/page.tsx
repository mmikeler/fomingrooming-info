import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { UsersTable } from "./components/UsersTable";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  });

  if (!user || !canManageUsers(user.role)) {
    redirect("/profile");
  }

  // Получаем всех пользователей
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      banReason: true,
      bannedAt: true,
      restrictedReason: true,
      restrictedAt: true,
      createdAt: true,
      _count: {
        select: { posts: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Админ-панель</h1>

      <div className="grid gap-6">
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Управление пользователями
          </h2>
          <UsersTable
            users={users}
            currentUserId={user.id}
            currentUserRole={user.role}
          />
        </section>
      </div>
    </div>
  );
}
