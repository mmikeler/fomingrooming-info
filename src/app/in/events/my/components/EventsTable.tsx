"use client";

import {
  Table,
  Button,
  Space,
  TableColumnsType,
  message,
  Popconfirm,
  Tag,
  Tooltip,
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

import { formatDateShort } from "@/app/components/ui/date";
import { Archive, ArchiveRestore, Edit, ThumbsUp, Trash2 } from "lucide-react";

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
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   align: "center",
    //   width: 60,
    // },
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <Link href={`/in/events/my/${record.id}`}>{title}</Link>
      ),
    },
    // {
    //   title: "Формат",
    //   dataIndex: "format",
    //   key: "format",
    //   render: (format: string) => formatLabels[format] || format,
    //   align: "center",
    // },
    // {
    //   title: "Дата",
    //   dataIndex: "startDate",
    //   key: "startDate",
    //   render: (startDate: Date) => formatDateShort(startDate),
    //   align: "center",
    // },
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
    // {
    //   title: "Создано",
    //   dataIndex: "created",
    //   key: "created",
    //   render: (created: Date) => formatDateShort(created),
    //   align: "center",
    // },
    {
      title: "Действия",
      key: "actions",
      render: (_, event) => (
        <Space.Compact>
          {event.status === "PUBLISHED" && (
            <Tooltip title="Опубликовать">
              <Button
                href={`/in/events/${event.slug}`}
                color="cyan"
                variant="filled"
              >
                <ThumbsUp size={16} />
              </Button>
            </Tooltip>
          )}
          {(event.status === "DRAFT" || event.status === "REJECTED") && (
            <>
              <Tooltip title="Опубликовать">
                <Button
                  color="cyan"
                  variant="filled"
                  onClick={() => handleSubmitEvent(event.id)}
                  loading={isPending}
                >
                  <ThumbsUp size={16} />
                </Button>
              </Tooltip>
              <Tooltip title="Редактировать">
                <Button
                  color="green"
                  href={`/in/events/my/${event.id}`}
                  variant="filled"
                >
                  <Edit size={16} />
                </Button>
              </Tooltip>
            </>
          )}
          {event.status === "ARCHIVED" && (
            <Tooltip title="Восстановить">
              <Button
                color="green"
                variant="filled"
                onClick={() => handleRestoreEvent(event.id)}
                loading={isPending}
              >
                <ArchiveRestore size={16} />
              </Button>
            </Tooltip>
          )}
          {event.status !== "ARCHIVED" && event.status !== "PENDING" && (
            <Tooltip title="Архивировать">
              <Button
                color="orange"
                variant="filled"
                onClick={() => handleArchiveEvent(event.id)}
                loading={isPending}
              >
                <Archive size={16} />
              </Button>
            </Tooltip>
          )}
          {event.status !== "PUBLISHED" && event.status !== "PENDING" && (
            <Popconfirm
              title="Вы уверены?"
              okText="Да"
              cancelText="Нет"
              onConfirm={() => handleDeleteEvent(event.id)}
            >
              <Tooltip title="Удалить">
                <Button color="danger" variant="filled">
                  <Trash2 size={16} />
                </Button>
              </Tooltip>
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
