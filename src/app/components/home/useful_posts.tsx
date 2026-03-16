import { Flex, Skeleton } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getLatestPosts, type LatestPost } from "./actions/getLatestPosts";
import { getExcerpt } from "../ui/excerpt";
import { ArrowRight } from "lucide-react";
import { ArrowRightOutlined } from "@ant-design/icons";

/**
 * Skeleton for loading posts
 */
function PostsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
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
 * Component for displaying post list
 */
async function PostsList() {
  const result = await getLatestPosts(3);

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div>
        {result.success && result.data?.length === 0
          ? "No published posts"
          : "Error loading posts"}
      </div>
    );
  }

  const posts = result.data;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  const excerpt = getExcerpt(post.content, 200);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <Image
          src={`https://picsum.dev/400/400?seed=${post.id}`}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex min-h-40 w-full flex-col sm:min-h-50">
        <h3 className="text-base font-semibold sm:text-lg">{post.title}</h3>
        <p className="mt-2 min-h-20 text-sm sm:min-h-25">{excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto pt-4 text-xs sm:pt-5"
        >
          Читать дальше <ArrowRightOutlined />
        </Link>
      </div>
    </div>
  );
}

/**
 * Useful posts component with Suspense
 */
export default function USEFUL_POSTS() {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <PostsList />
    </Suspense>
  );
}
