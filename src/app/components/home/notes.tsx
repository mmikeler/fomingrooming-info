import { Flex, Skeleton } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getLatestPosts, type LatestPost } from "./actions/getLatestPosts";
import { getExcerpt } from "../ui/excerpt";

/**
 * Skeleton for loading posts
 */
function PostsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-4 lg:flex-row">
          <Skeleton.Image
            active
            style={{ width: 200, height: 150 }}
            className="h-32! w-48!"
          />
          <div className="flex-1 p-2">
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Component for displaying post list
 */
async function PostsList() {
  const result = await getLatestPosts();

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="text-gray-500">
        {result.success && result.data?.length === 0
          ? "No published posts"
          : "Error loading posts"}
      </div>
    );
  }

  const posts = result.data;

  return (
    <div className="space-y-6">
      {posts.map((post: LatestPost) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

/**
 * Individual post card
 */
function PostCard({ post }: { post: LatestPost }) {
  const excerpt = getExcerpt(post.content, 500);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="relative hidden h-40 w-full shrink-0 overflow-hidden rounded-2xl sm:h-48 lg:block lg:h-50 lg:w-60 xl:min-w-75">
        <Image
          src={`https://picsum.dev/200/200?seed=${post.id}`}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex min-h-32 w-full flex-col py-2 lg:py-4">
        <h3 className="text-xl font-semibold">{post.title}</h3>
        <p className="mt-2 text-sm">{excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="mt-auto pt-5 text-xs">
          More details
        </Link>
      </div>
    </div>
  );
}

/**
 * Notes posts component with Suspense
 */
export default function NOTES_POSTS() {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <PostsList />
    </Suspense>
  );
}
