"use client";
import {
  Table,
  Button,
  Space,
  TableColumnsType,
  message,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import { createPost } from "../actions/createPost";
import { deletePost } from "../actions/deletePost";
import { submitPost, archivePost, restorePost } from "../actions/updatePost";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { PostStatus } from "@/generated/prisma/enums";
import {
  Archive,
  ArchiveRestore,
  Edit,
  ExternalLink,
  ThumbsUp,
  Trash2,
} from "lucide-react";

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
  const router = useRouter();

  const handleCreatePost = () => {
    startTransition(async () => {
      try {
        const result = await createPost();
        if (result.success) {
          message.success("Пост создан");
          router.push(`/in/posts/my/${result.data.id}`);
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
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   align: "center",
    //   width: 60,
    // },
    {
      title: "Заголовок",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <Link href={`/in/posts/my/${record.id}`}>{title}</Link>
      ),
    },
    // {
    //   title: "Содержание",
    //   dataIndex: "content",
    //   key: "content",
    //   render: (text: string | null) => {
    //     const content = text || "";
    //     const length = content.replace(/[^\p{L}\p{N}]/gu, "").length;
    //     return <span>{length} знаков</span>;
    //   },
    // },
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
            <Button
              href={`/in/posts/${post.slug}`}
              color="cyan"
              variant="filled"
            >
              <ExternalLink size={16} />
            </Button>
          )}
          {(post.status === "DRAFT" || post.status === "REJECTED") && (
            <>
              <Tooltip title="Опубликовать">
                <Button
                  color="primary"
                  variant="filled"
                  onClick={() => handleSubmitPost(post.id)}
                  loading={isPending}
                >
                  <ThumbsUp size={16} />
                </Button>
              </Tooltip>
              <Tooltip title="Редактировать">
                <Button
                  href={`/in/posts/my/${post.id}`}
                  color="green"
                  variant="filled"
                >
                  <Edit size={16} />
                </Button>
              </Tooltip>
            </>
          )}
          {post.status === "ARCHIVED" && (
            <Tooltip title="Восстановить">
              <Button
                color="green"
                variant="filled"
                onClick={() => handleRestorePost(post.id)}
                loading={isPending}
              >
                <ArchiveRestore size={16} />
              </Button>
            </Tooltip>
          )}
          {post.status !== "ARCHIVED" && post.status !== "PENDING" && (
            <Tooltip title="Архивировать">
              <Button
                color="orange"
                variant="filled"
                onClick={() => handleArchivePost(post.id)}
                loading={isPending}
              >
                <Archive size={16} />
              </Button>
            </Tooltip>
          )}
          {post.status !== "PUBLISHED" && post.status !== "PENDING" && (
            <Popconfirm
              title="Вы уверены?"
              okText="Да"
              cancelText="Нет"
              onConfirm={() => handleDeletePost(post.id)}
            >
              <Tooltip title="Удалить">
                <Button color="danger" variant="filled">
                  <Trash2 size={16} />
                </Button>
              </Tooltip>
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
