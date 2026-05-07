// Компонент ссылки на отдельную страницу поста

import { FeedItem } from "@/app/feed/actions/getFeed";
import { Divider } from "antd";
import { ChevronsRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PostPermalink({ post }: { post: FeedItem }) {
  const pathname = usePathname();
  const targetPath = `/in/${post.type === "POST" ? "posts" : "events"}/${post.slug}`;
  const isCurrentPage = pathname === targetPath;

  if (isCurrentPage) {
    return <Divider />;
  }

  return (
    <Divider titlePlacement="right">
      <Link
        href={targetPath}
        className="flex items-center gap-1 rounded-lg bg-rose-500! px-3 py-1 text-white! hover:bg-rose-600!"
      >
        <span className="text-[14px]">Перейти</span>
        <ChevronsRight size={16} />
      </Link>
    </Divider>
  );
}
