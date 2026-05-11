"use client";

// Универсальный компонент для отображения карточек любого типа постов

import { FeedItem } from "@/app/in/lenta/actions/getFeed";
import { Card } from "antd";
import PostAuthorAvatar from "./postAuthorAvatar";
import PostMainImage from "./postMainImage";
import { FavoriteButton } from "../FavoriteButton";
import PostMeta from "./postMeta";
import Title from "antd/es/typography/Title";
import PostFooter from "./postFooter";
import PostViewportTracker from "@/app/components/views/postViewportTracker";
import { PostPermalink } from "./postPermalink";
import PostContent from "./postContent";

export default function PostCard({
  post,
  isPreview = true,
}: {
  post: FeedItem;
  isPreview?: boolean;
}) {
  const content = post.content || post.description || "";

  return (
    <Card
      title={<PostAuthorAvatar userData={post.author} />}
      cover={<PostMainImage post={post} />}
      extra={
        <FavoriteButton
          itemId={post.id}
          type={post.type}
          initialIsFavorite={post.isFavorite}
        />
      }
    >
      <div className="border-b">
        <Title level={isPreview ? 3 : 1} className="text-2xl!">
          {post.title}
        </Title>
      </div>

      <PostMeta isPreview={isPreview} post={post} />

      <PostContent isPreview={isPreview} content={content} />

      <PostPermalink post={post} />

      <PostViewportTracker postId={post.id} postType={post.type}>
        <PostFooter post={post} />
      </PostViewportTracker>
    </Card>
  );
}
