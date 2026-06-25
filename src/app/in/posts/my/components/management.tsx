// Management post component

"use client";

import { PostStatus } from "@/generated/prisma/enums";
import { PostWithCounts } from "./PostEditForm";
import { Alert, Card, Button, Space, App } from "antd";
import PostStats from "../[id]/components/postStats";
import { useTransition } from "react";
import { changePostStatus } from "../actions/changePostStatus";

export function Management({ post }: { post: PostWithCounts }) {
  const [isPending, startTransition] = useTransition();
  const { message } = App.useApp();

  const changeStatus = (status: PostStatus) => {
    startTransition(async () => {
      try {
        const result = await changePostStatus(post.id, status);
        if ("error" in result) throw new Error(result.error);

        message.success("Статус поста успешно изменён");
      } catch {
        message.error("Что-то пошло не так.");
      }
    });
  };

  const { status } = post;

  return (
    <>
      {/* Причина блокировки */}
      {status === PostStatus.REJECTED && post.rejectionReason && (
        <div className="mb-4">
          <Alert title="Пост отклонён" description={post.rejectionReason} />
        </div>
      )}

      {/* УПРАВЛЕНИЕ */}
      <Card title="Управление" size="small">
        <Space orientation="vertical" className="w-full">
          <Button
            variant="outlined"
            color="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Сохранить
          </Button>

          {status === PostStatus.DRAFT && (
            <Button
              variant="outlined"
              color="green"
              onClick={() => changeStatus(PostStatus.PENDING)}
              loading={isPending}
              block
            >
              На модерацию
            </Button>
          )}

          {status === PostStatus.PUBLISHED && (
            <Button
              variant="outlined"
              color="default"
              onClick={() => changeStatus(PostStatus.DRAFT)}
              loading={isPending}
              block
            >
              Снять с публикации
            </Button>
          )}
        </Space>
      </Card>

      {/* Статистика */}
      <PostStats post={post} />
    </>
  );
}
