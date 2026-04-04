import { FeedItem } from "@/app/in/lenta/actions/getFeedItem";
import { Tooltip } from "antd";
import { Users } from "lucide-react";

export default function EventRegTag({ event }: { event: FeedItem }) {
  return (
    <Tooltip title="Количество участников">
      <div className="flex items-center gap-2 px-2">
        <Users size={14} />
        {event.registrationsCount}
      </div>
    </Tooltip>
  );
}
