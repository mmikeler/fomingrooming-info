import { notFound } from "next/navigation";
import Content from "./components/content";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { Metadata } from "next";
import Image from "next/image";
import ViewTracker from "@/app/components/views/viewTracker";
import {
  generateContentMetadata,
  type PostMetadataInput,
} from "@/lib/metadata";
import { getPublishedPost } from "@/app/in/lenta/actions/getFeedItem";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const result = await getPublishedPost(slug);

  if (!result.success || !result.data) {
    return {};
  }

  const post = result.data;

  const metadataInput: PostMetadataInput = {
    title: post.title,
    slug: post.slug,
    description: post.description,
    content: post.content,
    coverImage: post.coverImage,
    category: post.category,
    created: post.date,
    author: post.author,
  };

  // Определяем тип контента на основе категории
  const type = post.category === "ARTICLE" ? "ARTICLE" : "NEWS";

  return generateContentMetadata({
    data: metadataInput,
    type,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await getPublishedPost(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  return (
    <div className="container mx-auto min-h-[calc(100dvh-130px)] p-6">
      <ViewTracker postId={post.id} />
      <article className="mx-auto my-10 max-w-225">
        <div className="flex items-center justify-between text-stone-500">
          <Space size="small">
            <UserOutlined />
            <span>{post.author.name}</span>
          </Space>
          <Space size="small">
            <CalendarOutlined />
            <time>{new Date(post.date).toLocaleDateString()}</time>
          </Space>
        </div>
        <div className="mt-2">
          {/* Обложка поста */}
          {post.coverImage && (
            <div className="relative mb-6 h-75 w-full overflow-hidden rounded-lg">
              <Image
                src={post.coverImage}
                alt="Обложка статьи"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        <Content content={post.content || ""} />
      </article>
    </div>
  );
}
