"use client";
import { useEffect, useState } from "react";

import { Button, Flex, Form, Input, Switch } from "antd";
import { useRouter } from "next/navigation";
import { updatePost } from "../../actions/updatePost";
import dynamic from "next/dynamic";
import { debounce } from "lodash";
import rehypeSanitize from "rehype-sanitize";

interface Post {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
}

interface PostEditorProps {
  post: Post;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as commands from "@uiw/react-md-editor/commands";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function PostEditor({ post }: PostEditorProps) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string>(post.content || "");
  const router = useRouter();

  const onFinish = async (values: { title: string; published: boolean }) => {
    setLoading(true);
    try {
      await updatePost(post.id, values);
      router.push("/profile/posts");
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = debounce(async () => {
    await updatePost(post.id, { ...post, content: value });
  }, 1000);

  useEffect(() => {
    if (value) {
      updateContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      <Form
        layout="vertical"
        initialValues={{
          title: post.title,
          published: post.published,
        }}
        onFinish={onFinish}
      >
        <Flex gap={6} align="center" justify="space-between">
          <Form.Item
            layout="horizontal"
            label="Опубликовано"
            name="published"
            valuePropName="checked"
          >
            <Switch checkedChildren="Опубликовано" unCheckedChildren="Скрыто" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить
            </Button>
          </Form.Item>
        </Flex>

        <Form.Item
          label="Заголовок"
          name="title"
          rules={[{ required: true, message: "Введите заголовок" }]}
        >
          <Input size="large" />
        </Form.Item>
      </Form>
      <div className="container">
        <MDEditor
          value={value}
          onChange={(content) => setValue(content || "")}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]], // очистка и защита контента от XSS атак
          }}
          textareaProps={{
            placeholder: "Начните писать статью",
            maxLength: 2000,
          }}
          height={400}
        />
      </div>
    </>
  );
}
