"use client";

import { Select, Input } from "antd";
import type { PostCategory } from "@/generated/prisma/enums";

const { Search } = Input;

/**
 * Типы фильтров для постов
 */
export interface PostFilters {
  category: PostCategory | null;
  search: string | null;
}

interface PostsFiltersPanelProps {
  filters: PostFilters;
  onFilterChange: (filters: PostFilters) => void;
}

/**
 * Панель фильтров для постов
 */
export function PostsFiltersPanel({
  filters,
  onFilterChange,
}: PostsFiltersPanelProps) {
  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Поиск */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Поиск
          </label>
          <Search
            placeholder="Название или содержание"
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

        {/* Категория */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Категория
          </label>
          <Select
            placeholder="Все категории"
            allowClear
            className="w-full"
            value={filters.category}
            onChange={(value) =>
              onFilterChange({ ...filters, category: value })
            }
            options={[
              { value: "NEWS", label: "Новость" },
              { value: "ARTICLE", label: "Статья" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
