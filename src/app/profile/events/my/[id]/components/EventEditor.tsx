"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Flex,
  Form,
  Input,
  Tag,
  message,
  Tooltip,
  Select,
  DatePicker,
} from "antd";
import { useRouter } from "next/navigation";
import { updateEvent, submitEvent } from "../../actions/updateEvent";
import { checkEventSlugUniqueness } from "../../actions/checkEventSlug";
import dynamic from "next/dynamic";
import { debounce } from "lodash";
import { EventStatus, EventType } from "@/generated/prisma/enums";
import { slugify } from "@/lib/slug";
import { EventCoverUploader } from "../../components/EventCoverUploader";
import dayjs from "dayjs";

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  format: "ONLINE" | "OFFLINE";
  type: EventType | null;
  city: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  status: EventStatus;
  rejectionReason: string | null;
}

interface EventEditorProps {
  event: Event;
}

// Markdown editor - динамическая загрузка
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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

export function EventEditor({ event }: EventEditorProps) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string>(event.description || "");
  const [slug, setSlug] = useState<string>(event.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(event.coverImage);
  const [format, setFormat] = useState<"ONLINE" | "OFFLINE">(event.format);
  const [eventType, setEventType] = useState<EventType | null>(event.type);
  const router = useRouter();
  const [form] = Form.useForm();

  const canEdit =
    event.status === EventStatus.DRAFT || event.status === EventStatus.REJECTED;

  // Проверка уникальности slug с debounce
  const checkSlug = debounce(async (newSlug: string) => {
    if (!newSlug || newSlug.length < 3) return;

    const result = await checkEventSlugUniqueness(newSlug, event.id);
    if (result.success && !result.data.isUnique) {
      setSlugError(
        `Slug "${newSlug}" уже занят. Предлагается: ${result.data.suggestedSlug}`,
      );
    } else {
      setSlugError(null);
    }
  }, 500);

  const onFinish = async (values: {
    title: string;
    slug?: string;
    city?: string;
    location?: string;
  }) => {
    if (!canEdit) {
      message.error("Нельзя редактировать мероприятие в текущем статусе");
      return;
    }

    setLoading(true);
    try {
      const result = await updateEvent(event.id, {
        title: values.title,
        slug: values.slug || slug,
        description: value,
        format: format,
        type: eventType,
        city: values.city || null,
        location: values.location || null,
        coverImage: coverImage,
      });
      if (result.success) {
        message.success("Мероприятие сохранено");
        router.push("/profile/events");
      } else {
        message.error(result.error?.message || "Ошибка при сохранении");
      }
    } catch {
      message.error("Ошибка при сохранении мероприятия");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = (newCover: string | null) => {
    setCoverImage(newCover);
  };

  const handleFormatChange = (value: "ONLINE" | "OFFLINE") => {
    setFormat(value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Сначала сохраняем все изменения
      const values = form.getFieldsValue();
      await updateEvent(event.id, {
        title: values.title,
        slug: values.slug || slug,
        description: value,
        format: format,
        type: eventType,
        city: values.city || null,
        location: values.location || null,
        coverImage: coverImage,
      });

      // Затем отправляем на модерацию
      const result = await submitEvent(event.id);
      if (result.success) {
        message.success(
          result.data?.status === EventStatus.PUBLISHED
            ? "Мероприятие опубликовано"
            : "Мероприятие отправлено на модерацию",
        );
        router.push("/profile/events");
      } else {
        message.error(result.error?.message || "Ошибка");
      }
    } catch {
      message.error("Ошибка при отправке мероприятия");
    } finally {
      setLoading(false);
    }
  };

  const updateContent = debounce(async () => {
    if (!canEdit) return;
    await updateEvent(event.id, { description: value });
  }, 1000);

  useEffect(() => {
    if (value && canEdit) {
      updateContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: event.title,
          slug: event.slug,
          type: event.type,
          city: event.city,
          location: event.location,
          startDate: dayjs(event.startDate),
          endDate: dayjs(event.endDate),
        }}
        onFinish={onFinish}
      >
        <Flex gap={6} align="center" justify="space-between" wrap="wrap">
          <div className="flex items-center gap-4">
            <Tag color={statusColors[event.status]}>
              {statusLabels[event.status]}
            </Tag>
            {event.status === EventStatus.REJECTED && event.rejectionReason && (
              <span className="text-sm text-red-500">
                Причина: {event.rejectionReason}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Сохранить
                </Button>
                <Button
                  color="green"
                  variant="solid"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Опубликовать
                </Button>
              </>
            )}
          </div>
        </Flex>

        <Form.Item
          label="Название"
          name="title"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input
            size="large"
            disabled={!canEdit}
            onChange={(e) => {
              // Автогенерация slug при изменении названия
              const newSlug = slugify(e.target.value);
              setSlug(newSlug);
              form.setFieldValue("slug", newSlug);
              checkSlug(newSlug);
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Tooltip title="URL-адрес мероприятия. Можно редактировать вручную.">
              <span>
                Slug (URL){" "}
                <span className="text-xs text-gray-400">
                  → /events/{slug || "..."}
                </span>
              </span>
            </Tooltip>
          }
          name="slug"
          rules={[
            { required: true, message: "Введите slug" },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Только латинские буквы, цифры и дефисы",
            },
            {
              min: 3,
              message: "Минимум 3 символа",
            },
          ]}
          validateStatus={slugError ? "error" : undefined}
          help={slugError}
        >
          <Input
            size="large"
            disabled={!canEdit}
            onChange={(e) => {
              setSlug(e.target.value);
              checkSlug(e.target.value);
            }}
            placeholder="my-event-title"
          />
        </Form.Item>

        <Form.Item label="Формат" name="format">
          <Select
            value={format}
            onChange={handleFormatChange}
            disabled={!canEdit}
            options={[
              { value: "OFFLINE", label: "Оффлайн" },
              { value: "ONLINE", label: "Онлайн" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Тип мероприятия" name="type">
          <Select
            value={eventType}
            onChange={setEventType}
            disabled={!canEdit}
            allowClear
            placeholder="Выберите тип"
            options={[
              { value: "MASTERCLASS", label: "Мастер-класс" },
              { value: "SEMINAR", label: "Семинар" },
              { value: "KONKURS", label: "Конкурс" },
              { value: "LEKCIYA", label: "Лекция" },
              { value: "VEBINAR", label: "Вебинар" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Город" name="city">
          <Input size="large" disabled={!canEdit} placeholder="Москва" />
        </Form.Item>

        <Form.Item label="Место проведения" name="location">
          <Input
            size="large"
            disabled={!canEdit}
            placeholder="Адрес или ссылка на трансляцию"
          />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item
            label="Дата и время начала"
            name="startDate"
            rules={[{ required: true, message: "Выберите дату начала" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              disabled={!canEdit}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Дата и время окончания"
            name="endDate"
            rules={[{ required: true, message: "Выберите дату окончания" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              disabled={!canEdit}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Flex>
      </Form>

      <div className="mt-4">
        <h3 className="mb-2 text-lg font-semibold">Обложка мероприятия</h3>
        <EventCoverUploader
          currentCover={coverImage}
          onCoverChange={handleCoverChange}
          disabled={!canEdit}
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-lg font-semibold">Описание</h3>
        <MDEditor
          value={value}
          onChange={(content) => setValue(content || "")}
          textareaProps={{
            placeholder: "Начните писать о мероприятии",
            maxLength: 5000,
            disabled: !canEdit,
          }}
          height={300}
        />
      </div>
    </>
  );
}
