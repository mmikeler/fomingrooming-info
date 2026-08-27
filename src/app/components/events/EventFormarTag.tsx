import { FeedItem } from "@/app/in/lenta/actions/getFeedItem";
import { Tag, Tooltip } from "antd";
import { MapPin, Monitor } from "lucide-react";

export default function EventFormatTag({ event }: { event: FeedItem }) {
  const formatLabel = event.format === "ONLINE" ? "Онлайн" : "Оффлайн";
  const formatIcon =
    event.format === "ONLINE" ? <Monitor size={14} /> : <MapPin size={14} />;

  return (
    <Tooltip title="Формат проведения мероприятия: лично или в сети.">
      <Tag
        className="flex! items-center gap-1 border border-stone-100"
        style={{
          color: "gray",
          borderColor: "lightgray",
          fontWeight: 500,
        }}
      >
        {formatIcon} {formatLabel}
      </Tag>
    </Tooltip>
  );
}
