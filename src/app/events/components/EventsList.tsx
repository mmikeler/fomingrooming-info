"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Spin, Empty, Select, Input } from "antd";
import {
  getPublishedEvents,
  getEventCities,
  type PublishedEvent,
} from "../actions/getPublishedEvents";

const { Search } = Input;

/**
 * Типы фильтров
 */
interface EventFilters {
  format: "ONLINE" | "OFFLINE" | null;
  city: string | null;
  dateFilter: "upcoming" | "past" | "all" | null;
  search: string | null;
}

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
 * Карточка ивента
 */
function EventCard({ event }: { event: PublishedEvent }) {
  const formatLabel = event.format === "ONLINE" ? "Онлайн" : "Оффлайн";
  const formatIcon = event.format === "ONLINE" ? "💻" : "📍";
  const isUpcoming = new Date(event.startDate) > new Date();
  const isOngoing =
    new Date(event.startDate) <= new Date() &&
    new Date(event.endDate) >= new Date();

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Обложка */}
      <div className="relative h-48 w-full overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-400 to-purple-500">
            <span className="text-6xl">🐕</span>
          </div>
        )}
        {/* Бейдж формата */}
        <div className="absolute top-2 right-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">
          {formatIcon} {formatLabel}
        </div>
        {/* Бейдж статуса */}
        {isOngoing && (
          <div className="absolute top-2 left-2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow">
            Идет сейчас
          </div>
        )}
        {isUpcoming && !isOngoing && (
          <div className="absolute top-2 left-2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow">
            Скоро
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
          {event.title}
        </h3>

        {/* Дата */}
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
          <span>📅</span>
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
          <span>👥</span>
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

/**
 * Панель фильтров
 */
function FiltersPanel({
  filters,
  cities,
  onFilterChange,
}: {
  filters: EventFilters;
  cities: string[];
  onFilterChange: (filters: EventFilters) => void;
}) {
  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Поиск */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Поиск
          </label>
          <Search
            placeholder="Название или описание"
            allowClear
            value={filters.search ?? ""}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value || null })
            }
            onSearch={(value) =>
              onFilterChange({ ...filters, search: value || null })
            }
          />
        </div>

        {/* Формат */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Формат
          </label>
          <Select
            placeholder="Все форматы"
            allowClear
            className="w-full"
            value={filters.format}
            onChange={(value) => onFilterChange({ ...filters, format: value })}
            options={[
              { value: "ONLINE", label: "💻 Онлайн" },
              { value: "OFFLINE", label: "📍 Оффлайн" },
            ]}
          />
        </div>

        {/* Дата */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Когда
          </label>
          <Select
            placeholder="Все мероприятия"
            allowClear
            className="w-full"
            value={filters.dateFilter}
            onChange={(value) =>
              onFilterChange({ ...filters, dateFilter: value })
            }
            options={[
              { value: "upcoming", label: "Предстоящие" },
              { value: "past", label: "Прошедшие" },
              { value: "all", label: "Все" },
            ]}
          />
        </div>

        {/* Город */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Город
          </label>
          <Select
            placeholder="Все города"
            allowClear
            showSearch
            className="w-full"
            value={filters.city}
            onChange={(value) => onFilterChange({ ...filters, city: value })}
            options={cities.map((city) => ({ value: city, label: city }))}
          />
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
    city: null,
    dateFilter: null,
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
        city: currentFilters.city,
        dateFilter: currentFilters.dateFilter,
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
          <EventCard key={event.id} event={event} />
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
