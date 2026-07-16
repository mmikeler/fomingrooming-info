// MANAGE POST STATUS WIDGET
// Универсальный виджет для управления статусом поста

"use client";

import { changePostStatus } from "@/app/in/posts/my/actions/changePostStatus";
import { PostStatus } from "@/generated/prisma/enums";
import { Alert, App, Button } from "antd";
import { useSession } from "next-auth/react";
import { useTransition } from "react";

export function ManagePostStatusWidget({
  postID,
  postStatus,
}: {
  postID: number;
  postStatus: PostStatus;
}) {
  const { data: session } = useSession();
  const { message } = App.useApp();
  const [isTransitioning, startTransition] = useTransition();

  if (!session) return null;

  const isAdmin = session?.user.role.match(/ADMIN/);

  const isDraft = postStatus === PostStatus.DRAFT;
  const isPending = postStatus === PostStatus.PENDING;
  const isPublished = postStatus === PostStatus.PUBLISHED;
  //const isRejected = postStatus === PostStatus.REJECTED;

  // DEPRECATED для постов блога
  // const isArchived = postStatus === PostStatus.ARCHIVED;

  const changeStatus = (status: PostStatus) => {
    startTransition(async () => {
      try {
        const result = await changePostStatus(postID, status);
        if ("error" in result) throw new Error(result.error);
        message.success("Статус поста успешно изменён");
      } catch {
        message.error("Что-то пошло не так.");
      }
    });
  };

  return (
    <>
      {isPending && <Alert title="Пост на модерации" />}

      {isDraft && !isAdmin && (
        <Button
          variant="outlined"
          color="blue"
          onClick={() => changeStatus(PostStatus.PENDING)}
          loading={isTransitioning}
          block
        >
          На модерацию
        </Button>
      )}

      {isPublished && (
        <Button
          variant="outlined"
          color="default"
          onClick={() => changeStatus(PostStatus.DRAFT)}
          loading={isTransitioning}
          block
        >
          Снять с публикации
        </Button>
      )}

      {!isPublished && isAdmin && (
        <Button
          variant="outlined"
          color="green"
          onClick={() => changeStatus(PostStatus.PUBLISHED)}
          loading={isTransitioning}
          block
        >
          Опубликовать
        </Button>
      )}
    </>
  );
}
