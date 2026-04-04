import { Eye } from "lucide-react";
import type { FeedItem } from "@/app/in/lenta/actions/getFeedItem";

interface ViewsCounterProps {
  /** Пост или мероприятие */
  post: FeedItem;
}

/**
 * Компонент счётчика просмотров для постов и мероприятий
 * @param post - Пост или мероприятие (FeedItem)
 * @return Отображение количества просмотров
 */
export default function ViewsCounter({ post }: ViewsCounterProps) {
  const viewsCount = post.viewsCount || 0;

  return (
    <span className="flex items-center gap-1">
      <Eye size={18} />
      {viewsCount > 0 ? viewsCount : 0}
    </span>
  );
}
