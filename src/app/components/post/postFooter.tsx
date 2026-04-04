import { FeedItem } from "@/app/in/lenta/actions/getFeedItem";
import { formatDate } from "../ui/date";
import { Space } from "antd";
import LikeButton from "../likes/likeButton";
import ViewsCounter from "../views/viewsCounter";

export default function PostFooter({ post }: { post: FeedItem }) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <div className="text-gray-400 italic">{formatDate(post.date)}</div>
      <Space>
        <ViewsCounter post={post} />
        <LikeButton post={post} />
      </Space>
    </div>
  );
}
