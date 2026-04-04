"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Button, Spin, message, Tabs, Tooltip } from "antd";
import {
  DeleteOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Calendar, MapPin, Monitor } from "lucide-react";
import {
  toggleFavorite,
  type FavoriteItem,
} from "@/app/in/favorites/actions/favorites";
import { getExcerpt } from "@/app/components/ui/excerpt";
import { EventTypeTag } from "@/app/components/events/EventTypeTag";

interface FavoriteItemsListProps {
  items: FavoriteItem[];
}

import {
  formatDate,
  formatEventDate,
  formatDateWithMonthName,
} from "@/app/components/ui/date";

// Функция для получения изображения (с плейсхолдером)
function getImageUrl(coverImage: string | null, id: number): string {
  if (coverImage) return coverImage;
  return `https://picsum.dev/400/300?seed=${id}`;
}

export function FavoriteItemsList({
  items: initialItems,
}: FavoriteItemsListProps) {
  const [items, setItems] = useState<FavoriteItem[]>(initialItems);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const events = items.filter((item) => item.itemType === "EVENT");
  const posts = items.filter((item) => item.itemType === "POST");

  const filteredItems =
    activeTab === "all" ? items : activeTab === "EVENT" ? events : posts;

  const getCategoryLabel = (category: string) => {
    return category === "NEWS" ? "Новость" : "Статья";
  };

  const handleRemoveFavorite = async (itemId: number, type: string) => {
    setRemovingId(itemId);
    try {
      const result = await toggleFavorite(itemId, type as "EVENT" | "POST");
      if (result.success) {
        setItems((prev) =>
          prev.filter((item) => item.id !== itemId || item.itemType !== type),
        );
        message.success("Удалено из избранного");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-500">У вас пока нет избранного</p>
        <Link href="/profile/lenta" className="text-blue-600 hover:underline">
          Перейти к ленте
        </Link>
      </div>
    );
  }

  // Функция для определения статуса события
  const getEventStatus = (item: FavoriteItem) => {
    if (item.itemType !== "EVENT") return null;
    const startDate = item.startDate ? new Date(item.startDate) : null;
    const endDate = item.endDate ? new Date(item.endDate) : null;
    const now = new Date();

    if (startDate && endDate) {
      if (startDate <= now && endDate >= now) {
        return { text: "Идет сейчас", color: "bg-green-500" };
      }
      if (startDate > now) {
        return { text: "Скоро", color: "bg-blue-500" };
      }
      if (endDate < now) {
        return { text: "Завершено", color: "bg-gray-400" };
      }
    }
    return null;
  };

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "all",
            label: `Все (${items.length})`,
          },
          {
            key: "EVENT",
            label: (
              <span>
                <CalendarOutlined /> Мероприятия ({events.length})
              </span>
            ),
          },
          {
            key: "POST",
            label: (
              <span>
                <FileTextOutlined /> Посты ({posts.length})
              </span>
            ),
          },
        ]}
      />

      <div className="mx-auto mt-6 flex max-w-180 flex-col gap-6">
        {filteredItems.map((item, index) => {
          const isEvent = item.itemType === "EVENT";
          const displayImage = getImageUrl(item.coverImage, item.id);
          const formatLabel =
            isEvent && item.format === "ONLINE" ? "Онлайн" : "Оффлайн";
          const formatIcon =
            isEvent && item.format === "ONLINE" ? (
              <Monitor size={14} />
            ) : (
              <MapPin size={14} />
            );
          const eventStatus = isEvent ? getEventStatus(item) : null;
          const excerpt = getExcerpt(item.description || "", 500);

          return (
            <div
              key={`${item.itemType}-${item.id}-${index}`}
              className="flex items-start gap-3"
            >
              {/* Иконка-индикатор слева */}
              <div
                className={`flex shrink-0 items-center justify-center rounded-lg p-2 ${
                  isEvent
                    ? "bg-blue-100"
                    : item.category === "NEWS"
                      ? "bg-green-100"
                      : "bg-purple-100"
                }`}
              >
                {isEvent ? (
                  <CalendarOutlined
                    className="text-blue-500"
                    style={{ fontSize: 20 }}
                  />
                ) : item.category === "NEWS" ? (
                  <FileTextOutlined
                    className="text-green-500"
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <FileTextOutlined
                    className="text-purple-500"
                    style={{ fontSize: 20 }}
                  />
                )}
              </div>

              {/* Карточка */}
              <div className="flex-1">
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
                      <span className="hover:underline">
                        {item.author.name}
                      </span>
                    </Link>
                  }
                  cover={
                    <Link
                      target="_blank"
                      href={
                        isEvent
                          ? `/feed/events/${item.slug}`
                          : `/blog/${item.slug}`
                      }
                      className="block"
                    >
                      <div className="relative h-70 w-full overflow-hidden">
                        <Image
                          src={displayImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        {/* Бейдж формата для событий */}
                        {isEvent && (
                          <div className="absolute top-2 right-2 flex gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">
                            {formatIcon} {formatLabel}
                          </div>
                        )}
                        {/* Бейдж статуса для событий */}
                        {eventStatus && (
                          <div
                            className={`absolute top-2 left-2 rounded-full ${eventStatus.color} px-3 py-1 text-xs font-semibold text-white shadow`}
                          >
                            {eventStatus.text}
                          </div>
                        )}
                      </div>
                    </Link>
                  }
                  extra={
                    <Tooltip title="Удалить из избранного">
                      <Button
                        type="text"
                        danger
                        icon={
                          removingId === item.id ? (
                            <Spin size="small" />
                          ) : (
                            <DeleteOutlined />
                          )
                        }
                        onClick={() =>
                          handleRemoveFavorite(item.id, item.itemType)
                        }
                        loading={removingId === item.id}
                      />
                    </Tooltip>
                  }
                >
                  <div className="flex flex-col p-4">
                    {/* Тег типа мероприятия */}
                    {isEvent && (
                      <div className="mb-2 w-fit">
                        <EventTypeTag type={null} />
                      </div>
                    )}

                    <Link
                      target="_blank"
                      href={
                        isEvent
                          ? `/feed/events/${item.slug}`
                          : `/blog/${item.slug}`
                      }
                      className="block"
                    >
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
                        {isEvent
                          ? formatEventDate(item.startDate)
                          : formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Excerpt */}
                    {excerpt && (
                      <p className="mb-4 line-clamp-4 text-lg text-gray-600">
                        {excerpt}
                      </p>
                    )}

                    {/* Место для событий */}
                    {isEvent && (item.city || item.location) && (
                      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                        <span>{formatIcon}</span>
                        <span className="line-clamp-1">
                          {item.city && `${item.city}`}
                          {item.location && ` • ${item.location}`}
                        </span>
                      </div>
                    )}

                    {/* Категория для постов */}
                    {!isEvent && (
                      <div className="mb-2">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs ${
                            item.category === "NEWS"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                    )}

                    {/* Ссылка */}
                    <Link
                      target="_blank"
                      href={
                        isEvent
                          ? `/feed/events/${item.slug}`
                          : `/blog/${item.slug}`
                      }
                      className="mt-3 block text-right text-sm text-blue-500 hover:text-blue-600"
                    >
                      {isEvent ? "Подробнее →" : "Читать далее →"}
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            Нет материалов по выбранному фильтру
          </div>
        )}
      </div>
    </div>
  );
}
