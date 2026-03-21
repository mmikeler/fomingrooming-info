"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Spin, Alert } from "antd";
import { CalendarDays, Newspaper, FileText } from "lucide-react";
import {
  getFeedItems,
  type FeedItem,
  type FeedFilterType,
} from "../actions/getFeedItems";
import { PostCard } from "./PostCard";
import { EventCard } from "./EventCard";
import { FeedFilters } from "./FeedFilters";

/** Интерфейс пропсов */
interface FeedListProps {
  initialItems: FeedItem[];
  initialHasMore: boolean;
  initialNextCursor: string | null; // ISO date string
  initialFilter?: FeedFilterType;
}

/** Получить иконку и цвет для типа контента */
function getTypeIndicator(type: FeedItem["type"], category?: string) {
  switch (type) {
    case "EVENT":
      return {
        icon: <CalendarDays className="text-blue-500" size={20} />,
        bgColor: "bg-blue-100",
      };
    case "POST":
      if (category === "NEWS") {
        return {
          icon: <Newspaper className="text-green-500" size={20} />,
          bgColor: "bg-green-100",
        };
      } else {
        return {
          icon: <FileText className="text-purple-500" size={20} />,
          bgColor: "bg-purple-100",
        };
      }
    default:
      return {
        icon: <FileText className="text-gray-500" size={20} />,
        bgColor: "bg-gray-100",
      };
  }
}

/** Основной компонент списка ленты */
export default function FeedList({
  initialItems,
  initialHasMore,
  initialNextCursor,
  initialFilter = "ALL",
}: FeedListProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [filter, setFilter] = useState<FeedFilterType>(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Функция загрузки данных
  const loadData = useCallback(
    async (
      cursor: string | null = null,
      currentFilter: FeedFilterType = filter,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getFeedItems({
          cursor: cursor ?? undefined,
          limit: 10,
          filter: currentFilter,
        });

        if (result.success && result.data) {
          setItems(result.data.items);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor);
        } else {
          setError("Ошибка при загрузке");
        }
      } catch (err) {
        setError("Произошла ошибка при загрузке");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [filter],
  );

  // Обработчик изменения фильтра
  const handleFilterChange = useCallback(
    (newFilter: FeedFilterType) => {
      setFilter(newFilter);
      setNextCursor(null);
      loadData(null, newFilter);
    },
    [loadData],
  );

  // Функция загрузки дополнительных элементов
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !nextCursor) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getFeedItems({
        cursor: nextCursor,
        limit: 10,
        filter,
      });

      if (result.success && result.data) {
        setItems((prev) => [...prev, ...result.data.items]);
        setHasMore(result.data.hasMore);
        setNextCursor(result.data.nextCursor);
      } else {
        setError("Ошибка при загрузке");
      }
    } catch (err) {
      setError("Произошла ошибка при загрузке");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, nextCursor, filter]);

  // Обработчик изменения избранного
  const handleFavoriteToggle = useCallback(
    (id: number, isFavorite: boolean) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isFavorite } : item)),
      );
    },
    [],
  );

  // Intersection Observer для бесконечной подгрузки
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div>
      <FeedFilters activeFilter={filter} onFilterChange={handleFilterChange} />

      <div className="flex flex-col gap-6">
        {items.map((item, index) => {
          const indicator = getTypeIndicator(item.type, item.category);
          return (
            <div
              key={`${item.type}-${item.id}-${index}`}
              className="flex items-start gap-3"
            >
              {/* Иконка-индикатор слева */}
              <div
                className={`flex shrink-0 items-center justify-center rounded-lg p-2 ${indicator.bgColor}`}
              >
                {indicator.icon}
              </div>
              {/* Карточка */}
              <div className="flex-1">
                {item.type === "POST" ? (
                  <PostCard
                    item={item}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ) : (
                  <EventCard
                    item={item}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Spin size="large" />
          </div>
        )}

        {/* Сообщение об ошибке */}
        {error && (
          <Alert title={error} type="error" showIcon className="mx-4" />
        )}

        {/* Элемент для наблюдения за скроллом */}
        {hasMore && !isLoading && (
          <div ref={observerTarget} className="h-10 w-full" />
        )}

        {!hasMore && items.length > 0 && (
          <div className="py-8 text-center text-gray-500">
            Вы просмотрели все материалы
          </div>
        )}

        {items.length === 0 && !isLoading && (
          <div className="py-8 text-center text-gray-500">
            Нет материалов по выбранному фильтру
          </div>
        )}
      </div>
    </div>
  );
}
