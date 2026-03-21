import { Skeleton } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getLatestPosts, type LatestPost } from "./actions/getLatestPosts";
import { getExcerpt } from "@/app/components/ui/excerpt";

/**
 * Скелетон для загрузки постов
 */
function PostsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="w-full overflow-hidden rounded-2xl">
          <Skeleton.Image
            active
            style={{ width: "100%", height: 200 }}
            className="w-full!"
          />
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Компонент для отображения списка постов
 */
async function PostsList() {
  const result = await getLatestPosts();

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="text-gray-500">
        {result.success && result.data?.length === 0
          ? "Нет опубликованных постов"
          : "Ошибка при загрузке постов"}
      </div>
    );
  }

  const posts = result.data;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {posts.map((post: LatestPost) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

/**
 * Карточка отдельного поста
 */
function PostCard({ post }: { post: LatestPost }) {
  const excerpt = getExcerpt(post.content, 150);

  return (
    <div className="w-full">
      <div className="relative h-60 w-full overflow-hidden rounded-2xl sm:h-72 md:h-80">
        <Image
          src={`https://picsum.dev/400/200?seed=${post.id}`}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex min-h-32 flex-col py-4 sm:min-h-36">
        <h3 className="text-base font-semibold sm:text-lg">{post.title}</h3>
        <p className="mt-2 text-sm">{excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto text-right text-xs"
        >
          Читать статью
        </Link>
      </div>
    </div>
  );
}

/**
 * Компонент актуальных постов с Suspense
 */
export default function ACTUAL_POSTS() {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <PostsList />
    </Suspense>
  );
}
