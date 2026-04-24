// Users page

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { Divider } from "antd";
import { UsersTable } from "./components/UsersTable";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  });

  if (!user || !canManageUsers(user.role)) {
    redirect("/in");
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
    <>
      <Divider titlePlacement="left">
        <span className="rounded-full bg-sky-600 px-4 py-1 text-lg text-white">
          Управление пользователями
        </span>
      </Divider>
      <UsersTable
        users={users}
        currentUserId={user.id}
        currentUserRole={user.role}
      />
    </>
  );
}
