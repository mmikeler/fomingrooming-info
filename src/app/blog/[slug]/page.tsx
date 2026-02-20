import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Content from "./components/content";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { Metadata } from "next";
import { cleanMarkdown } from "@/lib/markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!post) return {};

  // Extract title from first h1
  const titleMatch = post.content?.match(/^#\s+(.+)$/m);
  const title = titleMatch ? cleanMarkdown(titleMatch[1]) : "Blog Post";

  // Extract first image src
  const imageMatch = post.content?.match(/!\[.*?\]\((.+?)\)/);
  const ogImage = imageMatch ? imageMatch[1] : undefined;

  return {
    title,
    openGraph: {
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!post || post.status !== "PUBLISHED") notFound();

  return (
    <div className="container mx-auto min-h-[calc(100dvh-130px)] p-6">
      <article className="mx-auto my-10 max-w-225">
        <div className="flex items-center justify-between text-stone-500">
          <Space size="small">
            <UserOutlined />
            <span>{post.author.name}</span>
          </Space>
          <Space size="small">
            <CalendarOutlined />
            <time>{new Date(post.created).toLocaleDateString()}</time>
          </Space>
        </div>
        <Content content={post.content || ""} />
      </article>
    </div>
  );
}
