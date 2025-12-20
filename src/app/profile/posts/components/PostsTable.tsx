"use client";
import { Table, Button, Space, TableColumnsType, message } from "antd";
import { createPost } from "../actions/createPost";
import { useTransition } from "react";
import Link from "next/link";
import { Post } from "@/generated/prisma/client";

const columns: TableColumnsType<Post> = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    align: "center",
  },
  {
    title: "Заголовок",
    dataIndex: "title",
    key: "title",
    render: (
      title: string,
      record: {
        id: number;
        title: string;
        content: string | null;
        published: boolean;
      },
    ) => <Link href={`/profile/posts/${record.id}`}>{title}</Link>,
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
    title: "Создан",
    dataIndex: "created",
    key: "created",
    render: (created: Date) => new Date(created).toLocaleDateString(),
    align: "center",
  },
  {
    title: "Опубликовано",
    dataIndex: "published",
    key: "published",
    render: (published: boolean) => (published ? "Да" : "Нет"),
    align: "center",
  },
  {
    title: "Действия",
    key: "actions",
    render: (value, post) => (
      <Space.Compact>
        <Button href={`/blog/${post.id}`} color="cyan" variant="filled">
          Перейти
        </Button>
        <Button color="danger" variant="filled">
          Удалить
        </Button>
      </Space.Compact>
    ),
    align: "center",
  },
];

export function PostsTable({ posts }: { posts: Post[] }) {
  const [isPending, startTransition] = useTransition();

  const handleCreatePost = () => {
    startTransition(async () => {
      try {
        await createPost();
      } catch (error) {
        message.error("Не удалось создать пост");
      }
    });
  };

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
