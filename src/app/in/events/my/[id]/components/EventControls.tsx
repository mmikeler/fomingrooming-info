// Form controls for the event page

"use client";

import { EventStatus } from "@/generated/prisma/client";
import { App, Button, Card, Divider, FormInstance, Tooltip } from "antd";
import { updateEvent } from "../../actions/updateEvent";
import { useState } from "react";
import { EventWithCounts } from "@/types/event";
import tips from "../lib/tips.json";
import { isDaysPassed } from "../lib/dates";

interface EventControlsProps {
  event: EventWithCounts;
  handlePublished: () => void;
  loading: boolean;
  form: FormInstance;
}

export default function EventControls(props: EventControlsProps) {
  const { event, handlePublished, loading, form } = props;
  const counts = event._count;
  const { message } = App.useApp();
  const { id, status } = event;
  const [selfLoading, setSelfLoading] = useState(false);

  const handleChangeStatus = (status: EventStatus) => {
    try {
      setSelfLoading(true);
      updateEvent(id, { status });
    } catch {
      message.error("Не удалось сохранить изменения. Попробуйте ещё раз.");
    } finally {
      setSelfLoading(false);
    }
  };

  // Compositions
  const isPublished = status === "PUBLISHED";
  const isArchived = status === "ARCHIVED";
  const isDraft = status === "DRAFT";
  const isRejected = status === "REJECTED";
  const isCanBeArchived =
    !isPublished && counts.registrations < 1 && !isArchived;
  const isCanBeDePublished =
    isPublished && (counts.registrations < 1 || isDaysPassed(event.endDate, 1));

  return (
    <Card title="Управление" size="small">
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => form.submit()}
          htmlType="submit"
          loading={loading}
          variant="outlined"
          color="primary"
        >
          Сохранить изменения
        </Button>
        {status !== "PUBLISHED" && status !== "REJECTED" && (
          <Button
            color="green"
            variant="outlined"
            onClick={handlePublished}
            loading={loading}
          >
            Опубликовать
          </Button>
        )}
        {status === "PUBLISHED" && (
          <Tooltip title={tips.isCanBeDePublished}>
            <Button
              color="default"
              variant="outlined"
              onClick={() => handleChangeStatus("DRAFT")}
              loading={selfLoading}
              disabled={!isCanBeDePublished}
            >
              Снять с публикации
            </Button>
          </Tooltip>
        )}
        <Divider />

        <Tooltip title={tips.isCanBeArchived}>
          <Button
            color="danger"
            variant="outlined"
            onClick={() => handleChangeStatus("ARCHIVED")}
            loading={selfLoading}
            disabled={!isCanBeArchived}
          >
            В архив
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
