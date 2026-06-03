import { Metadata } from "next";
import {
  generateContentMetadata,
  type PostMetadataInput,
} from "@/lib/metadata";
import PostCard from "@/app/components/post/postCard";
import { Empty } from "antd";
import { getFeedItem } from "../../lenta/actions/getFeedItem";
import Recommendations from "@/app/components/recommendations";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post) {
    return {};
  }

  const metadataInput: PostMetadataInput = {
    title: post.title,
    slug: post.slug,
    description: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    category: post.category,
    created: post.created,
    author: post.author,
  };

  return generateContentMetadata({
    data: metadataInput,
    type: "POST",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await getFeedItem({ idOrSlug: slug, type: "POST" });

  if (!result.success || !result.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty description="Запись не найдена" />
      </div>
    );
  }

  const post = result.data;

  return (
    <div className="container mx-auto min-h-[calc(100dvh-130px)] max-w-185 p-6">
      <PostCard post={post} isPreview={false} />
      <div className="my-10">
        <Recommendations record={post} limit={2} />
      </div>
    </div>
  );
}
