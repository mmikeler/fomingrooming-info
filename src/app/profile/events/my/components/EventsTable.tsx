"use client";

import {
  Table,
  Button,
  Space,
  TableColumnsType,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { createEvent } from "../actions/createEvent";
import { deleteEvent } from "../actions/deleteEvent";
import {
  submitEvent,
  archiveEvent,
  restoreEvent,
} from "../actions/updateEvent";
import { useTransition } from "react";
import Link from "next/link";
import { EventStatus } from "@/generated/prisma/enums";

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  format: "ONLINE" | "OFFLINE";
  city: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  status: EventStatus;
  rejectionReason: string | null;
  created: Date;
}

interface EventsTableProps {
  events: Event[];
}

const statusColors: Record<EventStatus, string> = {
  DRAFT: "default",
  PENDING: "processing",
  PUBLISHED: "success",
  REJECTED: "error",
  ARCHIVED: "warning",
};

const statusLabels: Record<EventStatus, string> = {
  DRAFT: "Черновик",
  PENDING: "На модерации",
  PUBLISHED: "Опубликовано",
  REJECTED: "Отклонено",
  ARCHIVED: "В архиве",
};

const formatLabels: Record<string, string> = {
  ONLINE: "Онлайн",
  OFFLINE: "Оффлайн",
};

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventsTable({ events }: EventsTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleCreateEvent = () => {
    startTransition(async () => {
      try {
        const result = await createEvent();
        if (result.success) {
          message.success("Мероприятие создано");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось создать мероприятие");
      }
    });
  };

  const handleDeleteEvent = (id: number) => {
    startTransition(async () => {
      try {
        const result = await deleteEvent(id);
        if (result.success) {
          message.success("Мероприятие удалено");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось удалить мероприятие");
      }
    });
  };

  const handleSubmitEvent = (id: number) => {
    startTransition(async () => {
      try {
        const result = await submitEvent(id);
        if (result.success) {
          message.success("Мероприятие отправлено на модерацию");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось отправить мероприятие");
      }
    });
  };

  const handleArchiveEvent = (id: number) => {
    startTransition(async () => {
      try {
        const result = await archiveEvent(id);
        if (result.success) {
          message.success("Мероприятие архивировано");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось архивировать мероприятие");
      }
    });
  };

  const handleRestoreEvent = (id: number) => {
    startTransition(async () => {
      try {
        const result = await restoreEvent(id);
        if (result.success) {
          message.success("Мероприятие восстановлено");
        } else {
          message.error(result.error?.message || "Ошибка");
        }
      } catch {
        message.error("Не удалось восстановить мероприятие");
      }
    });
  };

  const columns: TableColumnsType<Event> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 60,
    },
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <Link href={`/profile/events/my/${record.id}`}>{title}</Link>
      ),
    },
    {
      title: "Формат",
      dataIndex: "format",
      key: "format",
      render: (format: string) => formatLabels[format] || format,
      align: "center",
    },
    {
      title: "Дата",
      dataIndex: "startDate",
      key: "startDate",
      render: (startDate: Date) => formatDate(startDate),
      align: "center",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: EventStatus, record) => (
        <div>
          <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
          {status === "REJECTED" && record.rejectionReason && (
            <div className="mt-1 text-xs text-red-500">
              {record.rejectionReason}
            </div>
          )}
        </div>
      ),
      align: "center",
    },
    {
      title: "Создано",
      dataIndex: "created",
      key: "created",
      render: (created: Date) => formatDate(created),
      align: "center",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, event) => (
        <Space.Compact>
          {event.status === "PUBLISHED" && (
            <Button
              href={`/events/${event.slug}`}
              color="cyan"
              variant="filled"
            >
              Перейти
            </Button>
          )}
          {(event.status === "DRAFT" || event.status === "REJECTED") && (
            <>
              <Button
                color="primary"
                variant="filled"
                onClick={() => handleSubmitEvent(event.id)}
                loading={isPending}
              >
                Опубликовать
              </Button>
              <Button href={`/profile/events/${event.id}`} variant="filled">
                Редактировать
              </Button>
            </>
          )}
          {event.status === "ARCHIVED" && (
            <Button
              color="green"
              variant="filled"
              onClick={() => handleRestoreEvent(event.id)}
              loading={isPending}
            >
              Восстановить
            </Button>
          )}
          {event.status !== "ARCHIVED" && event.status !== "PENDING" && (
            <Button
              color="orange"
              variant="filled"
              onClick={() => handleArchiveEvent(event.id)}
              loading={isPending}
            >
              В архив
            </Button>
          )}
          {event.status !== "PUBLISHED" && event.status !== "PENDING" && (
            <Popconfirm
              title="Вы уверены?"
              okText="Да"
              cancelText="Нет"
              onConfirm={() => handleDeleteEvent(event.id)}
            >
              <Button color="danger" variant="filled">
                Удалить
              </Button>
            </Popconfirm>
          )}
        </Space.Compact>
      ),
      align: "center",
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={handleCreateEvent}
        loading={isPending}
        style={{ marginBottom: 16 }}
      >
        Создать мероприятие
      </Button>
      <Table<Event> columns={columns} dataSource={events} rowKey="id" />
    </div>
  );
}
