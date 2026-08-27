// Management post component

"use client";

import { PostStatus } from "@/generated/prisma/enums";
import { PostWithCounts } from "./PostEditForm";
import { Alert, Card, Button, Space } from "antd";
import PostStats from "../[id]/components/postStats";
import { useSession } from "next-auth/react";
import { ManagePostStatusWidget } from "@/app/components/post/managePostStatusWidget";

export function Management({
  post,
  isPending,
}: {
  post: PostWithCounts;
  isPending: boolean;
}) {
  const { data: session } = useSession();
  const { status } = post;

  if (!session) return null;

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

          <ManagePostStatusWidget postID={post.id} postStatus={status} />
        </Space>
      </Card>

      {/* Статистика */}
      <PostStats post={post} />
    </>
  );
}
