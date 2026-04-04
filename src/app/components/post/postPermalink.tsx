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
      <Link href={targetPath} className="flex items-center gap-1">
        <span className="text-[14px]">Подробнее</span>
        <ChevronsRight size={16} />
      </Link>
    </Divider>
  );
}
