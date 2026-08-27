"use client";

import { Select, Input, DatePicker } from "antd";
import dayjs from "dayjs";
import type { EventType } from "@/generated/prisma/enums";

const { Search } = Input;

/**
 * Типы фильтров
 */
export interface EventFilters {
  format: "ONLINE" | "OFFLINE" | null;
  type: EventType | null;
  city: string | null;
  dateRange: { start: string | null; end: string | null } | null;
  search: string | null;
}

interface FiltersPanelProps {
  filters: EventFilters;
  cities: string[];
  onFilterChange: (filters: EventFilters) => void;
}

/**
 * Панель фильтров
 */
export function FiltersPanel({
  filters,
  cities,
  onFilterChange,
}: FiltersPanelProps) {
  return (
    <div id="events_filters" className="mb-6 rounded-xl bg-white p-4 shadow-sm">
      {/* Поиск */}
      <div className="">
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
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              { value: "ONLINE", label: "Онлайн" },
              { value: "OFFLINE", label: "Оффлайн" },
            ]}
          />
        </div>

        {/* Тип */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Тип
          </label>
          <Select
            placeholder="Все типы"
            allowClear
            className="w-full"
            value={filters.type}
            onChange={(value) => onFilterChange({ ...filters, type: value })}
            options={[
              { value: "MASTERCLASS", label: "Мастер-класс" },
              { value: "SEMINAR", label: "Семинар" },
              { value: "KONKURS", label: "Конкурс" },
              { value: "LEKCIYA", label: "Лекция" },
              { value: "VEBINAR", label: "Вебинар" },
            ]}
          />
        </div>

        {/* Дата */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Дата
          </label>
          <div className="flex gap-2">
            <DatePicker
              className="flex-1"
              format="DD.MM.YYYY"
              placeholder="От"
              value={
                filters.dateRange?.start ? dayjs(filters.dateRange.start) : null
              }
              onChange={(date) => {
                onFilterChange({
                  ...filters,
                  dateRange: {
                    start: date ? date.toISOString() : null,
                    end: filters.dateRange?.end ?? null,
                  },
                });
              }}
              allowClear
            />
            <DatePicker
              className="flex-1"
              format="DD.MM.YYYY"
              placeholder="До"
              value={
                filters.dateRange?.end ? dayjs(filters.dateRange.end) : null
              }
              onChange={(date) => {
                onFilterChange({
                  ...filters,
                  dateRange: {
                    start: filters.dateRange?.start ?? null,
                    end: date ? date.toISOString() : null,
                  },
                });
              }}
              allowClear
            />
          </div>
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
