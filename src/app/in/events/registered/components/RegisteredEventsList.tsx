"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  cancelEventRegistration,
  type RegisteredEvent,
} from "../actions/getUserRegistrations";
import { CountdownTimer } from "@/app/components/CountdownTimer";

import {
  formatDateWithMonthName,
  formatEventDate,
} from "@/app/components/ui/date";

interface RegisteredEventsListProps {
  events: RegisteredEvent[];
}

export function RegisteredEventsList({ events }: RegisteredEventsListProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [localEvents, setLocalEvents] = useState(events);

  const handleCancel = async (eventId: number, eventTitle: string) => {
    if (
      !confirm(
        `Вы уверены, что хотите отменить регистрацию на "${eventTitle}"?`,
      )
    ) {
      return;
    }

    setLoadingId(eventId);
    try {
      const result = await cancelEventRegistration(eventId);
      if (result.success) {
        setLocalEvents((prev) => prev.filter((e) => e.eventId !== eventId));
      } else {
        alert(`Ошибка: ${result.error.message}`);
      }
    } catch (error) {
      alert("Произошла ошибка при отмене регистрации");
    } finally {
      setLoadingId(null);
    }
  };

  const getFormatLabel = (format: string) => {
    return format === "ONLINE" ? "Онлайн" : "Очно";
  };

  const isEventEnded = (endDate: Date) => {
    return new Date() > new Date(endDate);
  };

  if (localEvents.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-500">
          У вас пока нет регистраций на мероприятия
        </p>
        <Link href="/events" className="text-blue-600 hover:underline">
          Посмотреть доступные мероприятия
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localEvents.map((registration) => {
        const event = registration.event;
        const ended = isEventEnded(event.endDate);

        return (
          <div
            key={registration.id}
            className={`overflow-hidden rounded-lg border bg-white shadow-sm ${
              ended ? "opacity-60" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {/* Обложка мероприятия */}
              <div className="relative h-32 flex-shrink-0 md:h-auto md:w-48">
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
                        className={`flex-shrink-0 rounded-full px-2 py-1 text-xs ${
                          event.format === "ONLINE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getFormatLabel(event.format)}
                      </span>
                    </div>

                    {event.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {event.description}
                      </p>
                    )}

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
                        <span>
                          {formatDateWithMonthName(event.startDate)}
                          {event.startDate !== event.endDate &&
                            ` - ${formatDateWithMonthName(event.endDate)}`}
                        </span>
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

                      {event.location && (
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
                          <span>{event.location}</span>
                        </div>
                      )}

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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          Зарегистрирован{" "}
                          {formatDateWithMonthName(registration.registeredAt)}
                        </span>
                      </div>
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
                    {!ended && (
                      <button
                        onClick={() => handleCancel(event.id, event.title)}
                        disabled={loadingId === event.id}
                        className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {loadingId === event.id
                          ? "Отмена..."
                          : "Отменить регистрацию"}
                      </button>
                    )}
                    {ended && (
                      <span className="px-4 py-2 text-sm text-gray-400">
                        Мероприятие завершено
                      </span>
                    )}
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
