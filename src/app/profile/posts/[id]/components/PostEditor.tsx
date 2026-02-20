"use client";
import { useEffect, useState } from "react";

import { Button, Flex, Form, Input, Tag, message, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { updatePost, submitPost } from "../../actions/updatePost";
import { checkSlugUniqueness } from "../../actions/checkSlug";
import dynamic from "next/dynamic";
import { debounce } from "lodash";
import rehypeSanitize from "rehype-sanitize";
import { PostStatus } from "@/generated/prisma/enums";
import { slugify } from "@/lib/slug";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  status: PostStatus;
  rejectionReason: string | null;
}

interface PostEditorProps {
  post: Post;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as commands from "@uiw/react-md-editor/commands";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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

export function PostEditor({ post }: PostEditorProps) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string>(post.content || "");
  const [slug, setSlug] = useState<string>(post.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const router = useRouter();
  const [form] = Form.useForm();

  const canEdit =
    post.status === PostStatus.DRAFT || post.status === PostStatus.REJECTED;

  // Проверка уникальности slug с debounce
  const checkSlug = debounce(async (newSlug: string) => {
    if (!newSlug || newSlug.length < 3) return;

    const result = await checkSlugUniqueness(newSlug, post.id);
    if (result.success && !result.data.isUnique) {
      setSlugError(
        `Slug "${newSlug}" уже занят. Предлагается: ${result.data.suggestedSlug}`,
      );
    } else {
      setSlugError(null);
    }
  }, 500);

  const onFinish = async (values: { title: string; slug?: string }) => {
    if (!canEdit) {
      message.error("Нельзя редактировать пост в текущем статусе");
      return;
    }

    setLoading(true);
    try {
      const result = await updatePost(post.id, {
        title: values.title,
        slug: values.slug || slug,
        content: value,
      });
      if (result.success) {
        message.success("Пост сохранён");
        router.push("/profile/posts");
      } else {
        message.error(result.error?.message || "Ошибка при сохранении");
      }
    } catch {
      message.error("Ошибка при сохранении поста");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitPost(post.id);
      if (result.success) {
        message.success(
          result.data?.status === PostStatus.PUBLISHED
            ? "Пост опубликован"
            : "Пост отправлен на модерацию",
        );
        router.push("/profile/posts");
      } else {
        message.error(result.error?.message || "Ошибка");
      }
    } catch {
      message.error("Ошибка при отправке поста");
    } finally {
      setLoading(false);
    }
  };

  const updateContent = debounce(async () => {
    if (!canEdit) return;
    await updatePost(post.id, { content: value });
  }, 1000);

  useEffect(() => {
    if (value && canEdit) {
      updateContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: post.title,
          slug: post.slug,
        }}
        onFinish={onFinish}
      >
        <Flex gap={6} align="center" justify="space-between" wrap="wrap">
          <div className="flex items-center gap-4">
            <Tag color={statusColors[post.status]}>
              {statusLabels[post.status]}
            </Tag>
            {post.status === PostStatus.REJECTED && post.rejectionReason && (
              <span className="text-sm text-red-500">
                Причина: {post.rejectionReason}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Сохранить
                </Button>
                <Button
                  color="green"
                  variant="solid"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Опубликовать
                </Button>
              </>
            )}
          </div>
        </Flex>

        <Form.Item
          label="Заголовок"
          name="title"
          rules={[{ required: true, message: "Введите заголовок" }]}
        >
          <Input
            size="large"
            disabled={!canEdit}
            onChange={(e) => {
              // Автогенерация slug при изменении заголовка
              const newSlug = slugify(e.target.value);
              setSlug(newSlug);
              form.setFieldValue("slug", newSlug);
              checkSlug(newSlug);
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Tooltip title="URL-адрес поста. Можно редактировать вручную.">
              <span>
                Slug (URL){" "}
                <span className="text-xs text-gray-400">
                  → /blog/{slug || "..."}
                </span>
              </span>
            </Tooltip>
          }
          name="slug"
          rules={[
            { required: true, message: "Введите slug" },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Только латинские буквы, цифры и дефисы",
            },
            {
              min: 3,
              message: "Минимум 3 символа",
            },
          ]}
          validateStatus={slugError ? "error" : undefined}
          help={slugError}
        >
          <Input
            size="large"
            disabled={!canEdit}
            onChange={(e) => {
              setSlug(e.target.value);
              checkSlug(e.target.value);
            }}
            placeholder="my-post-title"
          />
        </Form.Item>
      </Form>
      <div className="container">
        <MDEditor
          value={value}
          onChange={(content) => setValue(content || "")}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
          textareaProps={{
            placeholder: "Начните писать статью",
            maxLength: 2000,
            disabled: !canEdit,
          }}
          height={400}
        />
      </div>
    </>
  );
}
