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
import { EventFormat, EventStatus } from "@/generated/prisma/enums";

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  format: EventFormat;
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
        <Link href={`/in/events/my/${record.id}`}>{title}</Link>
      ),
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
