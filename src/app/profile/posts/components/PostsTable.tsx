"use client";
import {
  Table,
  Button,
  Space,
  TableColumnsType,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { createPost } from "../actions/createPost";
import { deletePost } from "../actions/deletePost";
import { submitPost, archivePost, restorePost } from "../actions/updatePost";
import { useTransition } from "react";
import Link from "next/link";
import { PostStatus } from "@/generated/prisma/enums";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  status: PostStatus;
  rejectionReason: string | null;
  created: Date;
}

interface PostsTableProps {
  posts: Post[];
}

const statusColors: Record<PostStatus, string> = {
  DRAFT: "default",
  PENDING: "processing",
  PUBLISHED: "success",
  REJECTED: "error",
  ARCHIVED: "warning",
};

const statusLabels: Record<PostStatus, string> = {
  DRAFT: "Черновик",
  PENDING: "На модерации",
  PUBLISHED: "Опубликован",
  REJECTED: "Отклонён",
  ARCHIVED: "В архиве",
};

export function PostsTable({ posts }: PostsTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleCreatePost = () => {
    startTransition(async () => {
      try {
        const result = await createPost();
        if (result.success) {
          message.success("Пост создан");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось создать пост");
      }
    });
  };

  const handleDeletePost = (id: number) => {
    startTransition(async () => {
      try {
        const result = await deletePost(id);
        if (result.success) {
          message.success("Пост удалён");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось удалить пост");
      }
    });
  };

  const handleSubmitPost = (id: number) => {
    startTransition(async () => {
      try {
        const result = await submitPost(id);
        if (result.success) {
          message.success("Пост отправлен на модерацию");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось отправить пост");
      }
    });
  };

  const handleArchivePost = (id: number) => {
    startTransition(async () => {
      try {
        const result = await archivePost(id);
        if (result.success) {
          message.success("Пост архивирован");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось архивировать пост");
      }
    });
  };

  const handleRestorePost = (id: number) => {
    startTransition(async () => {
      try {
        const result = await restorePost(id);
        if (result.success) {
          message.success("Пост восстановлен");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось восстановить пост");
      }
    });
  };

  const columns: TableColumnsType<Post> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 60,
    },
    {
      title: "Заголовок",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <Link href={`/profile/posts/${record.id}`}>{title}</Link>
      ),
    },
    {
      title: "Содержание",
      dataIndex: "content",
      key: "content",
      render: (text: string | null) => {
        const content = text || "";
        const length = content.replace(/[^\p{L}\p{N}]/gu, "").length;
        return <span>{length} знаков</span>;
      },
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: PostStatus, record) => (
        <div>
          <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
          {status === "REJECTED" && record.rejectionReason && (
            <div className="mt-1 text-xs text-red-500">
              {record.rejectionReason}
            </div>
          )}
        </div>
      ),
      align: "center",
    },
    {
      title: "Создан",
      dataIndex: "created",
      key: "created",
      render: (created: Date) => new Date(created).toLocaleDateString(),
      align: "center",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, post) => (
        <Space.Compact>
          {post.status === "PUBLISHED" && (
            <Button href={`/blog/${post.slug}`} color="cyan" variant="filled">
              Перейти
            </Button>
          )}
          {(post.status === "DRAFT" || post.status === "REJECTED") && (
            <>
              <Button
                color="primary"
                variant="filled"
                onClick={() => handleSubmitPost(post.id)}
                loading={isPending}
              >
                Опубликовать
              </Button>
              <Button href={`/profile/posts/${post.id}`} variant="filled">
                Редактировать
              </Button>
            </>
          )}
          {post.status === "ARCHIVED" && (
            <Button
              color="green"
              variant="filled"
              onClick={() => handleRestorePost(post.id)}
              loading={isPending}
            >
              Восстановить
            </Button>
          )}
          {post.status !== "ARCHIVED" && post.status !== "PENDING" && (
            <Button
              color="orange"
              variant="filled"
              onClick={() => handleArchivePost(post.id)}
              loading={isPending}
            >
              В архив
            </Button>
          )}
          {post.status !== "PUBLISHED" && post.status !== "PENDING" && (
            <Popconfirm
              title="Вы уверены?"
              okText="Да"
              cancelText="Нет"
              onConfirm={() => handleDeletePost(post.id)}
            >
              <Button color="danger" variant="filled">
                Удалить
              </Button>
            </Popconfirm>
          )}
        </Space.Compact>
      ),
      align: "center",
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={handleCreatePost}
        loading={isPending}
        style={{ marginBottom: 16 }}
      >
        Создать пост
      </Button>
      <Table<Post> columns={columns} dataSource={posts} rowKey="id" />
    </div>
  );
}
