"use client";

import { CalendarDays, Newspaper, FileText, List } from "lucide-react";

export type FeedFilterType = "ALL" | "EVENT" | "NEWS" | "ARTICLE";

interface FeedFiltersProps {
  activeFilter: FeedFilterType;
  onFilterChange: (filter: FeedFilterType) => void;
}

const filters: {
  type: FeedFilterType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    type: "ALL",
    label: "Все",
    icon: <List size={18} />,
    color: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  },
  {
    type: "NEWS",
    label: "Новости",
    icon: <Newspaper size={18} />,
    color: "bg-green-100 text-green-600 hover:bg-green-200",
  },
  {
    type: "ARTICLE",
    label: "Статьи",
    icon: <FileText size={18} />,
    color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
  },
  {
    type: "EVENT",
    label: "Мероприятия",
    icon: <CalendarDays size={18} />,
    color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
  },
];

/** Панель фильтров для ленты */
export function FeedFilters({
  activeFilter,
  onFilterChange,
}: FeedFiltersProps) {
  return (
    <div className="mb-6 flex w-full flex-wrap items-center justify-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter.type}
          onClick={() => onFilterChange(filter.type)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeFilter === filter.type
              ? filter.color + " ring-2 ring-blue-400 ring-offset-2"
              : filter.color + " opacity-70"
          }`}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
