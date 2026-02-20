import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "./components/PostEditor";
import { PostStatus } from "@/generated/prisma/enums";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Пост не найден</h1>
        <p>Неверный ID поста.</p>
      </div>
    );
  }

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId: parseInt(session.user.id),
    },
  });

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Пост не найден</h1>
        <p>Запрашиваемый пост не существует или у вас нет доступа к нему.</p>
      </div>
    );
  }

  // Показываем предупреждение для постов, которые нельзя редактировать
  const canEdit =
    post.status === PostStatus.DRAFT || post.status === PostStatus.REJECTED;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Редактирование поста</h1>
      {!canEdit && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-yellow-800">
            Этот пост нельзя редактировать в текущем статусе. Вы можете только
            просмотреть его содержимое.
          </p>
        </div>
      )}
      <PostEditor post={post} />
    </div>
  );
}
