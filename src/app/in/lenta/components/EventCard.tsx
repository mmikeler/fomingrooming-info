"use client";

import { Card } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Monitor, PawPrint } from "lucide-react";
import type { FeedItem } from "../actions/getFeedItems";
import { getExcerpt } from "@/app/components/ui/excerpt";
import {
  extractFirstImageFromContent,
  getFullImageUrl,
} from "../utils/extractFirstImage";
import { EventTypeTag } from "@/app/components/events/EventTypeTag";
import { FavoriteButton } from "@/app/components/FavoriteButton";
import { formatDate, formatEventDate } from "@/app/components/ui/date";
import { getCoverBackground } from "../utils/coverBackground";

interface EventCardProps {
  item: FeedItem;
  onFavoriteToggle: (id: number, isFavorite: boolean) => void;
}

const EXCERPT_LENGTH = 500;

/** Карточка события */
export function EventCard({ item }: EventCardProps) {
  // Получаем изображение из контента/description, если нет обложки
  const contentSource = item.content || item.description;
  const fallbackImage =
    !item.coverImage && contentSource
      ? getFullImageUrl(extractFirstImageFromContent(contentSource))
      : null;
  const displayImage = item.coverImage || fallbackImage;

  const formatLabel = item.format === "ONLINE" ? "Онлайн" : "Оффлайн";
  const formatIcon =
    item.format === "ONLINE" ? <Monitor size={14} /> : <MapPin size={14} />;
  const isUpcoming = item.startDate && new Date(item.startDate) > new Date();
  const isOngoing =
    item.startDate &&
    item.endDate &&
    new Date(item.startDate) <= new Date() &&
    new Date(item.endDate) >= new Date();
  const isPast = item.endDate && new Date(item.endDate) < new Date();

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

  return (
    <Card
      title={
        <Link
          target="_blank"
          href={`/u/${item.author.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
        >
          {item.author.avatar ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={item.author.avatar}
                alt={item.author.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
              <span className="text-xs font-semibold text-gray-600">
                {item.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="hover:underline">{item.author.name}</span>
        </Link>
      }
      cover={
        <Link href={`/feed/events/${item.slug}`} className="block">
          <div className="relative h-70 w-full overflow-hidden">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={item.title}
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
            {/* Бейдж статуса */}
            {(isOngoing || isUpcoming || isPast) && (
              <div
                className={`absolute top-2 left-2 rounded-full ${getStatusColor()} px-3 py-1 text-xs font-semibold text-white shadow`}
              >
                {getStatusText()}
              </div>
            )}
          </div>
        </Link>
      }
      extra={
        <FavoriteButton
          itemId={item.id}
          type="POST"
          initialIsFavorite={item.isFavorite}
        />
      }
    >
      <div className="flex flex-col p-4">
        {/* Тег типа мероприятия */}
        <div className="mb-2 w-fit">
          <EventTypeTag type={item.eventType ?? null} />
        </div>

        <Link href={`/feed/events/${item.slug}`} className="block">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold hover:text-blue-600">
            {item.title}
          </h3>
        </Link>

        {/* Дата */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center">
            <Calendar size={16} className="text-gray-400" />
          </span>
          <span>
            {item.startDate
              ? formatEventDate(item.startDate)
              : formatDate(item.date)}
          </span>
        </div>

        {/* Excerpt */}
        {item.description && (
          <p className="mb-4 line-clamp-4 text-lg text-gray-600">
            {getExcerpt(item.description, EXCERPT_LENGTH)}
          </p>
        )}

        {/* Место */}
        {(item.city || item.location) && (
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <span>{formatIcon}</span>
            <span className="line-clamp-1">
              {item.city && `${item.city}`}
              {item.location && ` • ${item.location}`}
            </span>
          </div>
        )}

        {/* Количество участников */}
        {item.registrationsCount !== undefined && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center">
              <Users size={16} className="text-gray-400" />
            </span>
            <span>
              {item.registrationsCount}{" "}
              {item.registrationsCount === 1
                ? "участник"
                : item.registrationsCount >= 2 && item.registrationsCount <= 4
                  ? "участника"
                  : "участников"}
            </span>
          </div>
        )}

        {/* Ссылка */}
        <Link
          href={`/feed/events/${item.slug}`}
          className="mt-3 block text-right text-sm text-blue-500 hover:text-blue-600"
        >
          Подробнее →
        </Link>
      </div>
    </Card>
  );
}
