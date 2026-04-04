import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCreateContent } from "@/lib/permissions";
import { PostStatus } from "@/generated/prisma/enums";
import { PostEditForm } from "../components/PostEditForm";

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
    select: { status: true },
  });

  if (!user || !canCreateContent(user.status)) {
    notFound();
  }

  // Поиск поста с проверкой владельца
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId: parseInt(session.user.id),
    },
  });

  if (!post) {
    notFound();
  }

  // Проверка: можно редактировать только черновики и отклонённые посты
  if (post.status !== PostStatus.DRAFT && post.status !== PostStatus.REJECTED) {
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

  return <PostEditForm post={post} />;
}
