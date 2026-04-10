import { FeedItem } from "@/app/in/lenta/types";
import { formatEventDate } from "../ui/date";

export function EventRegDateTag({ event }: { event: FeedItem }) {
  const { startRegDate, endRegDate } = event;
  const isRegStart = startRegDate ? new Date(startRegDate) < new Date() : null;
  const isRegEnd = endRegDate ? new Date(endRegDate) < new Date() : null;

  return (
    <div className="text-sm">
      {isRegEnd
        ? "Регистрация завершена"
        : isRegStart
          ? "Регистрация до " + formatEventDate(endRegDate || "")
          : "Регистрация начнётся " + formatEventDate(startRegDate || "")}
    </div>
  );
}
