"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Spin, Empty } from "antd";
import {
  getPublishedEvents,
  getEventCities,
  type PublishedEvent,
} from "../actions/getPublishedEvents";
import { EventCard } from "./EventCard";
import { FiltersPanel, type EventFilters } from "./FiltersPanel";

/**
 * Скелетон загрузки для карточки ивента
 */
function EventCardSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="relative h-48 w-full animate-pulse bg-gray-200" />
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mb-4 h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
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

  // Обработчик переключения избранного
  const handleFavoriteToggle = (eventId: number, isFavorite: boolean) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, isFavorite } : event,
      ),
    );
  };

  // Начальная загрузка
  if (initialLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onFavoriteToggle={handleFavoriteToggle}
          />
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
