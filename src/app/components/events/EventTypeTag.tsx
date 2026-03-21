"use client";

import { Tag } from "antd";
import { EventType } from "@/generated/prisma/enums";
import {
  GraduationCap,
  Trophy,
  BookOpen,
  Video,
  Users,
  TreeDeciduous,
} from "lucide-react";

/**
 * Типы мероприятий с человекочитаемыми названиями и цветами
 */
const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  MASTERCLASS: {
    label: "Мастер-класс",
    color: "#722ed1",
    bgColor: "#efdbff",
    icon: <GraduationCap size={14} />,
  },
  SEMINAR: {
    label: "Семинар",
    color: "#1890ff",
    bgColor: "#e6f7ff",
    icon: <Users size={14} />,
  },
  KONKURS: {
    label: "Конкурс",
    color: "#fa541c",
    bgColor: "#fff7e6",
    icon: <Trophy size={14} />,
  },
  LEKCIYA: {
    label: "Лекция",
    color: "#13c2c2",
    bgColor: "#e6fffb",
    icon: <BookOpen size={14} />,
  },
  VEBINAR: {
    label: "Вебинар",
    color: "#52c41a",
    bgColor: "#f6ffed",
    icon: <Video size={14} />,
  },
  AREA: {
    label: "Площадка",
    color: "#70a533",
    bgColor: "#ecf5e1",
    icon: <TreeDeciduous size={14} />,
  },
};

/**
 * Props для компонента EventTypeTag
 */
interface EventTypeTagProps {
  /** Тип мероприятия из enum EventType */
  type: EventType | null;
  /** Дополнительные классы */
  className?: string;
}

/**
 * Компонент для отображения типа мероприятия в виде цветного тега
 * Использует Ant Design Tag с уникальными цветами для каждого типа
 */
export function EventTypeTag({ type, className = "" }: EventTypeTagProps) {
  // Если тип не указан, не отображаем тег
  if (!type) {
    return null;
  }

  const config = EVENT_TYPE_CONFIG[type];

  // Если тип не найден в конфигурации, возвращаем null
  if (!config) {
    return null;
  }

  return (
    <Tag
      color={config.bgColor}
      className={`${className} flex! items-center gap-1`}
      style={{
        color: config.color,
        borderColor: config.color,
        fontWeight: 500,
      }}
    >
      <span className="flex items-center">{config.icon}</span>
      {config.label}
    </Tag>
  );
}

/**
 * Хелпер для получения читаемого имени типа мероприятия
 */
export function getEventTypeLabel(type: EventType | null): string {
  if (!type) return "";
  return EVENT_TYPE_CONFIG[type]?.label ?? type;
}

/**
 * Хелпер для получения цвета типа мероприятия
 */
export function getEventTypeColor(
  type: EventType | null,
): { color: string; bgColor: string } | null {
  if (!type) return null;
  return EVENT_TYPE_CONFIG[type] ?? null;
}
