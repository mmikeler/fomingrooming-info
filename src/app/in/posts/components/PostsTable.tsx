"use client";

import { Table, Button, Space, TableColumnsType, Tag } from "antd";
import { useTransition } from "react";
import Link from "next/link";
import type { PostStatus, PostCategory } from "@/generated/prisma/enums";

interface Post {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  content: string | null;
  category: PostCategory;
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
  PUBLISHED: "Опубликовано",
  REJECTED: "Отклонено",
  ARCHIVED: "В архиве",
};

const categoryLabels: Record<PostCategory, string> = {
  NEWS: "Новость",
  ARTICLE: "Статья",
};

import { formatDateShort } from "@/app/components/ui/date";

export function PostsTable({ posts }: PostsTableProps) {
  const [isPending, startTransition] = useTransition();

  const columns: TableColumnsType<Post> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 60,
    },
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <Link href={`/in/posts/my/${record.id}`}>{title}</Link>
      ),
    },
    {
      title: "Категория",
      dataIndex: "category",
      key: "category",
      render: (category: PostCategory) => categoryLabels[category] || category,
      align: "center",
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
      title: "Создано",
      dataIndex: "created",
      key: "created",
      render: (created: Date) => formatDateShort(created),
      align: "center",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, post) => (
        <Space.Compact>
          {post.status === "PUBLISHED" && (
            <Button
              href={`/in/blog/${post.slug}`}
              color="cyan"
              variant="filled"
            >
              Перейти
            </Button>
          )}
          <Button href={`/in/posts/my/${post.id}`} variant="filled">
            Редактировать
          </Button>
        </Space.Compact>
      ),
      align: "center",
    },
  ];

  return (
    <div>
      <Table<Post> columns={columns} dataSource={posts} rowKey="id" />
    </div>
  );
}
