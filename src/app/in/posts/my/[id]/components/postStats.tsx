// Post Stats

import { Card, Space, Tooltip } from "antd";
import { Heart, ThumbsUp, ViewIcon } from "lucide-react";
import Link from "next/link";
import { PostWithCounts } from "../../components/PostEditForm";

export default function PostStats(props: { post: PostWithCounts }) {
  const { id, _count, viewsCount } = props.post;
  return (
    <Card
      size="small"
      title="Статистика"
      actions={[
        <Link key="stats" href={`/in/posts/my/${id}/stats`}>
          Подробнее
        </Link>,
      ]}
      style={{ width: 200 }}
    >
      <div className="flex flex-col gap-4">
        <Tooltip title="Добавлено в избранное">
          <div className="flex items-center">
            <Space>
              <Heart size={20} /> В избранном
            </Space>
            <span className="ms-auto font-semibold">{_count.favorites}</span>
          </div>
        </Tooltip>

        <Tooltip title="Понравилось">
          <div className="flex items-center">
            <Space>
              <ThumbsUp size={20} /> Понравилось
            </Space>
            <span className="ms-auto font-semibold">{_count.likes}</span>
          </div>
        </Tooltip>

        <Tooltip title="Просмотры">
          <div className="flex items-center">
            <Space>
              <ViewIcon size={20} /> Просмотры
            </Space>
            <span className="ms-auto font-semibold">{viewsCount}</span>
          </div>
        </Tooltip>
      </div>
    </Card>
  );
}
