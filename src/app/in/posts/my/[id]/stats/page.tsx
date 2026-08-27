// Post stats page

import { PostStatus } from "@/generated/prisma/enums";
import { authOptions } from "@/lib/auth";
import { canCreateContent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PostEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const { id } = await params;
  const postId = parseInt(id);

  if (isNaN(postId)) {
    notFound();
  }

  // Проверка авторизации
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  // Проверка статуса аккаунта
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { status: true, role: true },
  });

  if (!user || !canCreateContent(user.status)) {
    notFound();
  }

  const isAdmin = user.role.match(/ADMIN/);

  // Поиск поста с проверкой владельца
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId: parseInt(session.user.id),
    },
    include: {
      _count: {
        select: {
          favorites: true,
          likes: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Проверка: можно редактировать только черновики и отклонённые посты
  if (
    post.status !== PostStatus.DRAFT &&
    post.status !== PostStatus.REJECTED &&
    !isAdmin
  ) {
    // Редирект на страницу списка постов
    return (
      <div className="p-6">
        <h1 className="text-xl text-red-500">
          Нельзя редактировать пост в текущем статусе
        </h1>
        <p className="mt-2">
          Вы можете редактировать только черновики и отклонённые посты.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link
        href={`/in/posts/my/${post.id}`}
        className="flex w-fit items-center gap-2"
      >
        <ArrowLeft size={20} /> Назад к редактированию
      </Link>

      <div className="p-5">Недостаточно информации</div>
    </div>
  );
}
