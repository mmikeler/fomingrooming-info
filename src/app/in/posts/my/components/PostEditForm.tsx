"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Form, Input, Select, Button, App, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PostCoverUploader } from "./PostCoverUploader";
import { updatePost } from "../actions/updatePost";
import { PostCategory } from "@/generated/prisma/enums";
import { postCategoryOptions } from "@/lib/postCategoryLabels";
import { Post } from "@/generated/prisma/client";
import {
  statusColors,
  statusLabels,
} from "@/app/in/events/my/[id]/components/EventEditor";
import { Management } from "./management";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

export type PostWithCounts = Post & {
  _count: {
    favorites: number;
    likes: number;
  };
};

export function PostEditForm({ post }: { post: PostWithCounts }) {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { message: appMessage } = App.useApp();

  const [coverImage, setCoverImage] = useState<string | null>(
    post.coverImage || null,
  );
  const [content, setContent] = useState<string>(post.content || "");
  const [excerpt, setExcerpt] = useState<string>(post.excerpt || "");

  // Устанавливаем начальные значения формы
  useEffect(() => {
    form.setFieldsValue({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      category: post.category,
    });
  }, [form, post]);

  const handleSave = async (values: {
    title: string;
    slug: string;
    excerpt: string;
    category: PostCategory;
  }) => {
    startTransition(async () => {
      try {
        const result = await updatePost(post.id, {
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt || null,
          content,
          coverImage,
        });

        if (result.success) {
          appMessage.success("Пост сохранён");
          router.refresh();
        } else {
          appMessage.error(result.error?.message || "Ошибка при сохранении");
        }
      } catch {
        appMessage.error("Ошибка при сохранении");
      }
    });
  };

  const handleSubmitFailed = () => {
    appMessage.error("Пожалуйста, заполните все обязательные поля");
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/in/posts/my">
          <Button icon={<ArrowLeftOutlined />}>К списку постов</Button>
        </Link>
        {/* СТАТУС ПОСТА */}
        <Tag
          variant="solid"
          className="p-1! px-2! text-[16px]!"
          color={statusColors[post.status]}
        >
          {statusLabels[post.status]}
        </Tag>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onFinishFailed={handleSubmitFailed}
        initialValues={{
          category: post.category,
        }}
      >
        <div className="flex gap-4">
          {/* Левая колонка - основные поля */}
          <div className="w-180 max-w-full">
            {/* Обложка */}
            <div className="mb-4">
              <h3 className="mb-1 font-semibold">Обложка</h3>
              <PostCoverUploader
                currentCover={coverImage}
                onCoverChange={setCoverImage}
                disabled={isPending}
              />
            </div>

            <Form.Item
              name="title"
              label="Заголовок"
              rules={[{ required: true, message: "Введите заголовок" }]}
            >
              <Input
                placeholder="Введите заголовок поста"
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="slug"
              label="URLslug"
              rules={[{ required: true, message: "Введите slug" }]}
              tooltip="URL адрес поста (например: my-post)"
            >
              <Input placeholder="my-post" />
            </Form.Item>

            <Form.Item
              name="excerpt"
              label="Краткое описание"
              tooltip="Краткое описание для анонса, используется в карточках постов"
            >
              <Input.TextArea
                placeholder="Введите краткое описание (до 300 символов)"
                maxLength={300}
                showCount
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Категория"
              rules={[{ required: true, message: "Выберите категорию" }]}
            >
              <Select
                placeholder="Выберите категорию"
                options={postCategoryOptions}
              />
            </Form.Item>

            <Form.Item
              label="Контент"
              required
              tooltip="Основное содержание поста в формате Markdown"
            >
              <div data-color-mode="light">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  height={500}
                  preview="edit"
                  enableScroll={true}
                />
              </div>
            </Form.Item>
          </div>

          {/* Правая колонка - обложка и действия */}
          <div className="relative mt-6 w-50">
            <div className="sticky top-6 flex flex-col gap-5">
              <Management post={post} />
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
