"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Form, Input, Select, Button, Space, message, App } from "antd";
import {
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PostCoverUploader } from "./PostCoverUploader";
import { updatePost, submitPost } from "../actions/updatePost";
import { PostCategory, PostStatus } from "@/generated/prisma/enums";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  status: PostStatus;
  category: PostCategory;
}

interface PostEditFormProps {
  post: Post;
}

const categoryOptions = [
  { value: PostCategory.NEWS, label: "Новость" },
  { value: PostCategory.ARTICLE, label: "Статья" },
];

export function PostEditForm({ post }: PostEditFormProps) {
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

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const result = await submitPost(post.id);

        if (result.success) {
          appMessage.success("Пост отправлен на модерацию");
          router.push("/in/posts/my");
        } else {
          appMessage.error(result.error?.message || "Ошибка при отправке");
        }
      } catch {
        appMessage.error("Ошибка при отправке");
      }
    });
  };

  const handleSubmitFailed = () => {
    appMessage.error("Пожалуйста, заполните все обязательные поля");
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/in/posts/my">
          <Button icon={<ArrowLeftOutlined />}>К списку постов</Button>
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Редактирование поста</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onFinishFailed={handleSubmitFailed}
        initialValues={{
          category: post.category,
        }}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Левая колонка - основные поля */}
          <div className="lg:col-span-2">
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
                options={categoryOptions}
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
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="mb-4 rounded-lg border bg-white p-4">
                <h3 className="mb-4 font-semibold">Обложка поста</h3>
                <PostCoverUploader
                  currentCover={coverImage}
                  onCoverChange={setCoverImage}
                  disabled={isPending}
                />
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h3 className="mb-4 font-semibold">Действия</h3>
                <Space direction="vertical" className="w-full">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={isPending}
                    block
                  >
                    Сохранить
                  </Button>
                  <Button
                    type="primary"
                    color="green"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={isPending}
                    block
                  >
                    Отправить на модерацию
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
