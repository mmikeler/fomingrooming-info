"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Spin, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  toggleFavorite,
  type FavoriteEvent,
} from "@/app/favorites/actions/favorites";
import { CountdownTimer } from "@/app/components/CountdownTimer";

// Функция форматирования даты
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

interface FavoriteEventsListProps {
  events: FavoriteEvent[];
}

export function FavoriteEventsList({
  events: initialEvents,
}: FavoriteEventsListProps) {
  const [events, setEvents] = useState<FavoriteEvent[]>(initialEvents);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const getFormatLabel = (format: string) => {
    return format === "ONLINE" ? "Онлайн" : "Очно";
  };

  const isEventEnded = (endDate: Date) => {
    return new Date() > new Date(endDate);
  };

  const handleRemoveFavorite = async (eventId: number) => {
    setRemovingId(eventId);
    try {
      const result = await toggleFavorite(eventId);
      if (result.success) {
        // Удаляем мероприятие из списка
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        message.success("Мероприятие удалено из избранного");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-500">
          У вас пока нет избранных мероприятий
        </p>
        <Link href="/events" className="text-blue-600 hover:underline">
          Посмотреть доступные мероприятия
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((favorite) => {
        const event = favorite;
        const ended = isEventEnded(event.startDate);

        return (
          <div
            key={favorite.id}
            className={`overflow-hidden rounded-lg border bg-white shadow-sm ${
              ended ? "opacity-60" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {/* Обложка мероприятия */}
              <div className="relative h-32 shrink-0 md:h-auto md:w-48">
                {event.coverImage ? (
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-400">Нет фото</span>
                  </div>
                )}
              </div>

              {/* Информация о мероприятии */}
              <div className="flex-1 p-4">
                <div className="flex h-full flex-col">
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className="text-lg font-semibold transition-colors hover:text-blue-600"
                      >
                        {event.title}
                      </Link>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                          event.format === "ONLINE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getFormatLabel(event.format)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(event.startDate)}</span>
                      </div>

                      <CountdownTimer targetDate={event.startDate} />

                      {event.city && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{event.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/events/${event.slug}`}
                      className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                    >
                      Подробнее
                    </Link>
                    <Button
                      danger
                      icon={
                        removingId === event.id ? (
                          <Spin size="small" />
                        ) : (
                          <DeleteOutlined />
                        )
                      }
                      onClick={() => handleRemoveFavorite(event.id)}
                      loading={removingId === event.id}
                    >
                      Убрать
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
