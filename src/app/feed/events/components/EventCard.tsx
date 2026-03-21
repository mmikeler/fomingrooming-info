"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Spin } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { Calendar, MapPin, Users, Monitor, PawPrint } from "lucide-react";
import { EventTypeTag } from "@/app/components/events/EventTypeTag";
import { toggleFavorite } from "@/app/favorites/actions/favorites";
import type { PublishedEvent } from "../actions/getPublishedEvents";
import {
  extractFirstImageFromContent,
  getFullImageUrl,
} from "@/app/profile/lenta/utils/extractFirstImage";

/**
 * Форматирование даты
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EventCardProps {
  event: PublishedEvent;
  onFavoriteToggle: (eventId: number, isFavorite: boolean) => void;
}

/**
 * Карточка ивента
 */
export function EventCard({ event, onFavoriteToggle }: EventCardProps) {
  const formatLabel = event.format === "ONLINE" ? "Онлайн" : "Оффлайн";
  const formatIcon =
    event.format === "ONLINE" ? <Monitor size={14} /> : <MapPin size={14} />;
  const isUpcoming = new Date(event.startDate) > new Date();
  const isOngoing =
    new Date(event.startDate) <= new Date() &&
    new Date(event.endDate) >= new Date();
  const isPast = new Date(event.endDate) < new Date();

  // Состояние для анимации и локального управления избранным
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(event.isFavorite);
  const [isToggling, setIsToggling] = useState(false);

  // Синхронизируем с пропсом при изменении
  useEffect(() => {
    setIsFavoriteLocal(event.isFavorite);
  }, [event.isFavorite]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsToggling(true);
    try {
      const result = await toggleFavorite(event.id);
      if (result.success) {
        const newState = result.data?.isFavorite ?? false;
        setIsFavoriteLocal(newState);
        onFavoriteToggle(event.id, newState);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsToggling(false);
    }
  };

  // Определение цвета статуса
  const getStatusColor = () => {
    if (isOngoing) return "bg-green-500";
    if (isUpcoming) return "bg-blue-500";
    if (isPast) return "bg-gray-400";
    return "bg-gray-500";
  };

  const getStatusText = () => {
    if (isOngoing) return "Идет сейчас";
    if (isUpcoming) return "Скоро";
    if (isPast) return "Завершено";
    return "";
  };

  // Получаем изображение из description, если нет обложки
  const fallbackImage =
    !event.coverImage && event.description
      ? getFullImageUrl(extractFirstImageFromContent(event.description))
      : null;
  const displayImage = event.coverImage || fallbackImage;

  // Определение цвета фона обложки в зависимости от статуса
  const getCoverBackground = () => {
    if (isOngoing) return "bg-linear-to-br from-green-400 to-emerald-500";
    if (isUpcoming) return "bg-linear-to-br from-blue-400 to-purple-500";
    if (isPast) return "bg-linear-to-br from-gray-400 to-gray-500";
    return "bg-linear-to-br from-blue-400 to-purple-500";
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Обложка */}
      <div className="relative h-48 w-full overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${getCoverBackground()}`}
          >
            <span className="text-6xl">
              <PawPrint />
            </span>
          </div>
        )}
        {/* Бейдж формата */}
        <div className="absolute top-2 right-2 flex gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">
          {formatIcon} {formatLabel}
        </div>
        {/* Бейдж статуса с цветовой индикацией */}
        {(isOngoing || isUpcoming || isPast) && (
          <div
            className={`absolute top-2 left-2 rounded-full ${getStatusColor()} px-3 py-1 text-xs font-semibold text-white shadow`}
          >
            {getStatusText()}
          </div>
        )}
        {/* Бейдж типа */}
        {event.type && (
          <div className="absolute bottom-2 left-2">
            <EventTypeTag type={event.type} />
          </div>
        )}
        {/* Интерактивная кнопка избранного */}
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className={`absolute right-2 bottom-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110 focus:ring-2 focus:ring-red-400 focus:outline-none ${
            isFavoriteLocal
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-600 hover:bg-red-100 hover:text-red-500"
          }`}
          title={
            isFavoriteLocal ? "Удалить из избранного" : "Добавить в избранное"
          }
        >
          {isToggling ? (
            <Spin size="small" />
          ) : isFavoriteLocal ? (
            <HeartFilled />
          ) : (
            <HeartOutlined />
          )}
        </button>
      </div>

      {/* Контент */}
      <div className="flex flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
          {event.title}
        </h3>

        {/* Дата */}
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center">
            <Calendar size={16} className="text-gray-400" />
          </span>
          <span>{formatDate(event.startDate)}</span>
        </div>

        {/* Место */}
        {(event.city || event.location) && (
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <span>{formatIcon}</span>
            <span className="line-clamp-1">
              {event.city && `${event.city}`}
              {event.location && ` • ${event.location}`}
            </span>
          </div>
        )}

        {/* Количество участников */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center">
            <Users size={16} className="text-gray-400" />
          </span>
          <span>
            {event._count.registrations}{" "}
            {event._count.registrations === 1
              ? "участник"
              : event._count.registrations >= 2 &&
                  event._count.registrations <= 4
                ? "участника"
                : "участников"}
          </span>
        </div>

        {/* Автор */}
        <Link
          href={`/u/${event.author.slug}`}
          className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
        >
          {event.author.avatar ? (
            <div className="relative h-6 w-6 overflow-hidden rounded-full">
              <Image
                src={event.author.avatar}
                alt={event.author.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300">
              <span className="text-xs font-semibold text-gray-600">
                {event.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="hover:underline">{event.author.name}</span>
        </Link>

        {/* Ссылка на ивент */}
        <Link
          href={`/events/${event.slug}`}
          className="mt-3 block rounded-lg bg-blue-500 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
