"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Spin, Empty } from "antd";
import { FiltersPanel, type EventFilters } from "./FiltersPanel";
import {
  getEventCities,
  getPublishedEvents,
  PublishedEvent,
} from "../actions/getPublishedEvents";
import PostCard from "@/app/components/post/postCard";
import type { FeedItem } from "@/app/in/lenta/actions/getFeedItems";
import ADS from "@/app/components/ads/ads";

/**
 * Преобразование PublishedEvent в формат FeedItem для PostCard
 */
function transformEventForCard(event: PublishedEvent): FeedItem {
  return {
    id: event.id,
    type: "EVENT",
    title: event.title,
    slug: event.slug,
    description: event.description,
    coverImage: event.coverImage,
    date: event.startDate,
    author: event.author,
    content: event.description,
    format: event.format,
    eventType: event.type,
    city: event.city,
    location: event.location,
    startDate: event.startDate,
    endDate: event.endDate,
    startRegDate: event.startRegDate,
    endRegDate: event.endRegDate,
    registrationsCount: event._count.registrations,
    isFavorite: event.isFavorite,
    isLiked: false,
    likesCount: 0,
    viewsCount: 0,
    isAuthor: false,
  };
}

/**
 * Скелетон загрузки для панели фильтров
 */
function FiltersPanelSkeleton() {
  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
      {/* Поиск */}
      <div className="mb-4">
        <div className="mb-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Формат */}
        <div>
          <div className="mb-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-10 animate-pulse rounded bg-gray-200" />
        </div>
        {/* Тип */}
        <div>
          <div className="mb-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-10 animate-pulse rounded bg-gray-200" />
        </div>
        {/* Дата */}
        <div>
          <div className="mb-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 animate-pulse rounded bg-gray-200" />
            <div className="h-10 flex-1 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        {/* Город */}
        <div>
          <div className="mb-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-10 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

/**
 * Скелетон загрузки для карточки ивента (стилизованный под PostCard)
 */
function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      {/* Обложка - как в PostCard */}
      <div className="relative h-48 w-full animate-pulse bg-gray-200" />
      {/* Контент - как в PostCard */}
      <div className="border-b p-4">
        {/* Заголовок */}
        <div className="mb-2 h-8 w-3/4 animate-pulse rounded bg-gray-200" />
        {/* Мета информация */}
        <div className="mb-3 flex items-center gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        {/* Описание */}
        <div className="mb-4 h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        {/* Автор */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент списка ивентов с ленивой загрузкой и фильтрами
 */
export default function EventsList() {
  const [events, setEvents] = useState<PublishedEvent[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [filters, setFilters] = useState<EventFilters>({
    format: null,
    type: null,
    city: null,
    dateRange: null,
    search: null,
  });
  const observerRef = useRef<HTMLDivElement>(null);

  // Частота размещения рекламы
  const AD_FREQUENCY = 3; // Размещать каждые 3 поста

  // Загрузка начальных данных
  useEffect(() => {
    loadEvents();
    loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Перезагрузка при изменении фильтров
  useEffect(() => {
    if (!initialLoading) {
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadCities = async () => {
    try {
      const result = await getEventCities();
      if (result.success && result.data) {
        setCities(result.data);
      }
    } catch (err) {
      console.error("Error loading cities:", err);
    }
  };

  const loadEvents = async (
    cursorParam?: number | null,
    forceFilters?: EventFilters,
  ) => {
    if (loading || (!cursorParam && !hasMore)) return;

    setLoading(true);
    setError(null);

    const currentFilters = forceFilters ?? filters;

    try {
      const result = await getPublishedEvents({
        cursor: cursorParam ?? undefined,
        format: currentFilters.format,
        type: currentFilters.type,
        city: currentFilters.city,
        dateRange: currentFilters.dateRange,
        search: currentFilters.search,
      });

      if (result.success && result.data) {
        const { events: newEvents, nextCursor, hasMore: more } = result.data;

        if (cursorParam) {
          // Дополнительная загрузка
          setEvents((prev) => [...prev, ...newEvents]);
        } else {
          // Начальная загрузка или сброс при фильтрации
          setEvents(newEvents);
        }

        setCursor(nextCursor);
        setHasMore(more);
      } else if (!result.success) {
        setError(result.error?.message ?? "Ошибка при загрузке мероприятий");
      }
    } catch (err) {
      setError("Произошла ошибка при загрузке мероприятий");
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setCursor(null);
    setHasMore(true);
    loadEvents(null, newFilters);
  };

  // Observer для бесконечной прокрутки
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && cursor) {
        loadEvents(cursor, filters);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasMore, loading, cursor, filters],
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  // Начальная загрузка
  if (initialLoading) {
    return (
      <div>
        <FiltersPanelSkeleton />
        <div className="mx-auto flex max-w-185 flex-col gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Ошибка при начальной загрузке
  if (error && events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => loadEvents()}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  // Пустой список
  if (!initialLoading && events.length === 0) {
    return (
      <div>
        <FiltersPanel
          filters={filters}
          cities={cities}
          onFilterChange={handleFilterChange}
        />
        <Empty
          description="Нет мероприятий, соответствующих выбранным фильтрам"
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div>
      {/* Панель фильтров */}
      <FiltersPanel
        filters={filters}
        cities={cities}
        onFilterChange={handleFilterChange}
      />

      {/* Список ивентов */}
      <div className="mx-auto flex max-w-185 flex-col gap-10">
        {events.map((event, index) => (
          <Fragment key={index}>
            <PostCard
              key={event.id}
              post={transformEventForCard(event)}
              isPreview={false}
            />
            {/* Рекламное место */}
            {index % AD_FREQUENCY === 0 && (
              <ADS place="EVENTS" className="h-50 w-full" />
            )}
          </Fragment>
        ))}
      </div>

      {/* Индикатор загрузки */}
      {hasMore && (
        <div ref={observerRef} className="mt-8 flex justify-center py-4">
          {loading && <Spin size="large" />}
        </div>
      )}

      {/* Кнопка загрузки следующей страницы (fallback) */}
      {!loading && hasMore && cursor && (
        <div className="mt-8 text-center">
          <button
            onClick={() => loadEvents(cursor, filters)}
            className="rounded-lg bg-gray-100 px-6 py-2 text-gray-600 hover:bg-gray-200"
          >
            Загрузить ещё
          </button>
        </div>
      )}

      {/* Конец списка */}
      {!hasMore && events.length > 0 && (
        <p className="mt-8 text-center text-gray-500">
          Все мероприятия загружены
        </p>
      )}
    </div>
  );
}
