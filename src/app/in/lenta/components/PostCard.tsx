"use client";

import { Card } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Calendar, PawPrint } from "lucide-react";
import type { FeedItem } from "../actions/getFeedItems";
import { getExcerpt } from "@/app/components/ui/excerpt";
import { formatDate } from "@/app/components/ui/date";
import { getCoverBackground } from "../utils/coverBackground";
import {
  extractFirstImageFromContent,
  getFullImageUrl,
} from "../utils/extractFirstImage";
import { FavoriteButton } from "@/app/components/FavoriteButton";

interface PostCardProps {
  item: FeedItem;
  onFavoriteToggle: (id: number, isFavorite: boolean) => void;
}

/** Карточка поста (новости/статьи) */
export function PostCard({ item }: PostCardProps) {
  // Получаем изображение из контента, если нет обложки
  const fallbackImage =
    !item.coverImage && item.content
      ? getFullImageUrl(extractFirstImageFromContent(item.content))
      : null;
  const displayImage = item.coverImage || fallbackImage;

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
        <Link href={`/blog/${item.slug}`} className="block">
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
      {/* Контент */}
      <div className="flex flex-col p-4">
        <Link href={`/blog/${item.slug}`} className="block">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold hover:text-blue-600">
            {item.title}
          </h3>
        </Link>

        {/* Дата */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center">
            <Calendar size={16} className="text-gray-400" />
          </span>
          <span>{formatDate(item.date)}</span>
        </div>

        {/* Excerpt */}
        {item.description && (
          <p className="mb-4 line-clamp-4 text-lg text-gray-600">
            {getExcerpt(item.description, 500)}
          </p>
        )}

        {/* Ссылка */}
        <Link
          href={`/feed/blog/${item.slug}`}
          className="mt-3 block text-right text-sm text-blue-500 hover:text-blue-600"
        >
          Читать далее →
        </Link>
      </div>
    </Card>
  );
}
