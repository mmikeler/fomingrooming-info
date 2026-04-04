import { FeedItem } from "@/app/in/lenta/actions/getFeedItem";
import { CountdownTimer } from "../CountdownTimer";
import { Tag, Tooltip } from "antd";

export default function EventStatusTag({ event }: { event: FeedItem }) {
  const isUpcoming = event.startDate && new Date(event.startDate) > new Date();
  const isOngoing =
    event.startDate &&
    event.endDate &&
    new Date(event.startDate) <= new Date() &&
    new Date(event.endDate) >= new Date();
  const isPast = event.endDate && new Date(event.endDate) < new Date();

  const getStatusColor = () => {
    if (isOngoing) return "bg-green-500";
    if (isUpcoming) return "bg-blue-500";
    if (isPast) return "bg-gray-400";
    return "bg-gray-500";
  };

  const getStatusText = () => {
    if (isOngoing) return "Идет сейчас";
    if (isUpcoming) {
      const now = new Date();
      const startDate = new Date(event.startDate!);
      const diffTime = startDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 1) {
        return <CountdownTimer targetDate={event.startDate} />;
      }

      if (diffDays < 7) {
        return "Скоро";
      }

      if (diffDays < 30) {
        return `Через ${diffDays} дн.`;
      }
      return "Более месяца";
    }
    if (isPast) return "Завершено";
    return "";
  };

  if (isOngoing || isUpcoming || isPast)
    return (
      <Tooltip title="Время до начала мероприятия">
        <Tag color={"blue"} variant="outlined">
          {getStatusText()}
        </Tag>
      </Tooltip>
    );

  return null;
}
