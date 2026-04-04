import { FeedItem } from "@/app/in/lenta/actions/getFeedItem";
import { Tooltip } from "antd";
import { MapPinHouseIcon } from "lucide-react";

export default function EventPlaceTag({ event }: { event: FeedItem }) {
  if (event.city || event.location) {
    return (
      <Tooltip title="Место проведения">
        <div className="mb-2 flex items-center gap-2">
          <MapPinHouseIcon size={18} />
          <span className="line-clamp-1">
            {event.city && `${event.city}`}
            {event.location && ` • ${event.location}`}
          </span>
        </div>
      </Tooltip>
    );
  }
  return null;
}
