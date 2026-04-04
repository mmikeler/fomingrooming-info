import { ArrowRightOutlined } from "@ant-design/icons";
import { Card, Flex, Space, Skeleton } from "antd";
import Image from "next/image";
import { Timer } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  getNearestEventsForWidget,
  type WidgetEvent,
} from "./actions/getNearestEvents";
import Button from "@/app/components/ui/button";

/**
 * Скелетон загрузки для виджета мероприятий
 */
function EventsSkeleton() {
  return (
    <div className="p-2 lg:p-0">
      <div className="text-[10px] uppercase">
        Ближайшие мероприятия в твоём городе
      </div>
      <div className="relative mt-3 overflow-hidden rounded-lg bg-gray-900 p-10 text-white">
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Card
            key={i}
            style={{ width: "100%" }}
            variant="borderless"
            cover={
              <Skeleton.Image
                active
                style={{ width: "100%", height: 160 }}
                className="w-full!"
              />
            }
          >
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Форматирование даты
 */
function formatEventDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Вычисление оставшегося времени до мероприятия
 */
function getTimeRemaining(eventDate: Date): string {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  if (diff <= 0) {
    return "Идёт сейчас";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}д ${hours}ч ${minutes}м`;
  }
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
}

/**
 * Компонент для отображения первого (главного) мероприятия
 */
function MainEventCard({ event }: { event: WidgetEvent }) {
  const eventDate = new Date(event.startDate);
  const timeRemaining = getTimeRemaining(eventDate);

  return (
    <div className="relative mt-3 overflow-hidden rounded-lg bg-gray-900 p-10 text-white">
      <div className="mt-5 text-2xl font-bold">
        <span>{formatEventDate(eventDate)}</span> |{" "}
        <span>{event.city || "Город не указан"}</span>
      </div>
      <h1 className="mt-12 text-5xl font-bold">{event.title}</h1>
      <div className="mt-7 text-xl">
        {event.location || "Место проведения не указано"}
      </div>
      <Flex>
        <div className="mt-10 w-full lg:mt-20">
          <div className="text-xl">До конца регистрации:</div>
          <Space>
            <Timer /> <span className="text-lg">{timeRemaining}</span>
          </Space>
        </div>
        <div className="mt-10 w-full lg:mt-20">
          <Link href={`/in/events/${event.slug}`}>
            <Button className="w-full lg:py-7">Участвовать</Button>
          </Link>
        </div>
      </Flex>
    </div>
  );
}

/**
 * Компонент для отображения карточки мероприятия
 */
function EventCard({ event }: { event: WidgetEvent }) {
  const eventDate = new Date(event.startDate);
  const imageUrl =
    event.coverImage || `https://picsum.dev/400/200?seed=${event.id}`;

  return (
    <Card
      key={event.id}
      style={{ width: "100%" }}
      variant="borderless"
      cover={
        <Image
          draggable={false}
          width={400}
          height={200}
          alt={event.title}
          src={imageUrl}
          className="h-40 object-cover"
        />
      }
    >
      <div className="line-clamp-2 font-bold">{event.title}</div>
      <div className="mt-1 text-xs">{formatEventDate(eventDate)}</div>
    </Card>
  );
}

/**
 * Список мероприятий
 */
async function EventsList() {
  const events = await getNearestEventsForWidget();

  if (events.length === 0) {
    return (
      <div className="p-2 lg:p-0">
        <div className="text-[10px] uppercase">Ближайшие мероприятия</div>
        <div className="mt-5 text-center text-gray-500">
          На данный момент нет запланированных мероприятий
        </div>
      </div>
    );
  }

  const mainEvent = events[0];
  const additionalEvents = events.slice(1, 3);

  return (
    <div className="p-2 lg:p-0">
      <div className="text-[10px] uppercase">
        Ближайшие мероприятия в твоём городе
      </div>
      <MainEventCard event={mainEvent} />
      {additionalEvents.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {additionalEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      <div className="mt-5 flex justify-end">
        <Link href="/in/events">
          <Button>
            <Space>
              Все мероприятия <ArrowRightOutlined />
            </Space>
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Основной компонент виджета мероприятий
 */
export default function EVENT_BAR() {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsList />
    </Suspense>
  );
}
