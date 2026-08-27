"use client";

import { useState } from "react";
import { approveEvent, rejectEvent } from "../actions/moderateEvent";

interface Author {
  id: number;
  name: string;
  email: string;
}

interface Event {
  id: number;
  title: string;
  description: string | null;
  format: "ONLINE" | "OFFLINE";
  city: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  created: Date;
  author: Author;
}

interface EventsModerationQueueProps {
  events: Event[];
}

export function EventsModerationQueue({
  events: initialEvents,
}: EventsModerationQueueProps) {
  const [events, setEvents] = useState(initialEvents);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<number | null>(null);

  const handleApprove = async (eventId: number) => {
    setLoading(eventId);
    try {
      const result = await approveEvent(eventId);
      if (result.success) {
        setEvents(events.filter((e) => e.id !== eventId));
      } else {
        alert(result.error?.message || "Ошибка при одобрении мероприятия");
      }
    } catch (error) {
      alert("Ошибка при одобрении мероприятия");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (eventId: number) => {
    if (!reason.trim()) {
      alert("Укажите причину отклонения");
      return;
    }

    setLoading(eventId);
    try {
      const result = await rejectEvent(eventId, reason);
      if (result.success) {
        setEvents(events.filter((e) => e.id !== eventId));
        setRejectingId(null);
        setReason("");
      } else {
        alert(result.error?.message || "Ошибка при отклонении мероприятия");
      }
    } catch (error) {
      alert("Ошибка при отклонении мероприятия");
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (events.length === 0) {
    return null;
  }

  const formatLabel = (format: "ONLINE" | "OFFLINE") =>
    format === "ONLINE" ? "Онлайн" : "Оффлайн";

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-md"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {event.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Автор: {event.author.name} ({event.author.email})
              </p>
              <p className="text-sm text-gray-500">
                Создан: {formatDate(event.created)}
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Формат:</span>{" "}
                {formatLabel(event.format)}
              </div>
              {event.city && (
                <div>
                  <span className="font-medium">Город:</span> {event.city}
                </div>
              )}
              {event.location && (
                <div className="col-span-2">
                  <span className="font-medium">Место:</span> {event.location}
                </div>
              )}
              <div>
                <span className="font-medium">Начало:</span>{" "}
                {formatDate(event.startDate)}
              </div>
              <div>
                <span className="font-medium">Окончание:</span>{" "}
                {formatDate(event.endDate)}
              </div>
            </div>
          </div>

          {event.description && (
            <div className="prose prose-sm mb-6 max-w-none rounded-lg bg-gray-50 p-4">
              <div className="whitespace-pre-wrap text-gray-700">
                {event.description.length > 500
                  ? `${event.description.substring(0, 500)}...`
                  : event.description}
              </div>
            </div>
          )}

          {rejectingId === event.id ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Причина отклонения
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Укажите причину отклонения мероприятия..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(event.id)}
                  disabled={loading === event.id}
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading === event.id
                    ? "Отклонение..."
                    : "Подтвердить отклонение"}
                </button>
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setReason("");
                  }}
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(event.id)}
                disabled={loading === event.id}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading === event.id ? "Одобрение..." : "Одобрить"}
              </button>
              <button
                onClick={() => setRejectingId(event.id)}
                disabled={loading === event.id}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Отклонить
              </button>
              <a
                href={`/profile/events/${event.id}`}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Подробнее
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
