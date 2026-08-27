// Event Stats

import { EventWithCounts } from "@/types/event";
import { Card, Space, Tooltip } from "antd";
import { Heart, ThumbsUp, Users2, ViewIcon } from "lucide-react";
import Link from "next/link";

export default function EventStats(props: { event: EventWithCounts }) {
  const { id, _count, viewsCount } = props.event;
  return (
    <Card
      size="small"
      title="Статистика"
      actions={[
        <Link key="stats" href={`/in/events/my/${id}/stats`}>
          Подробнее
        </Link>,
      ]}
      style={{ width: 200 }}
    >
      <div className="flex flex-col gap-4">
        <Tooltip title="Количество участников">
          <div className="flex items-center">
            <Space>
              <Users2 size={20} /> Участники
            </Space>
            <span className="ms-auto font-semibold">
              {_count.registrations}
            </span>
          </div>
        </Tooltip>

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
