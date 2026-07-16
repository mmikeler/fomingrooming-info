"use client";

import { useEffect, useState } from "react";

import {
  Form,
  Input,
  Tag,
  Tooltip,
  Select,
  DatePicker,
  Divider,
  Space,
  App,
} from "antd";
import { useRouter } from "next/navigation";
import { updateEvent, submitEvent } from "../../actions/updateEvent";
import { checkEventSlugUniqueness } from "../../actions/checkEventSlug";
import dynamic from "next/dynamic";
import { debounce } from "lodash";
import {
  EventFormat,
  EventStatus,
  EventType,
  UserRole,
} from "@/generated/prisma/enums";
import { slugify } from "@/lib/slug";
import { EventCoverUploader } from "../../components/EventCoverUploader";
import dayjs from "dayjs";
import EventControls from "./EventControls";
import {
  CalendarClock,
  CalendarCog,
  CalendarRange,
  Link,
  MapPinHouse,
} from "lucide-react";
import { EventWithCounts } from "@/types/event";
import EventStats from "./eventStats";

// Markdown editor - динамическая загрузка
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export const statusColors: Record<EventStatus, string> = {
  DRAFT: "default",
  PENDING: "processing",
  PUBLISHED: "success",
  REJECTED: "error",
  ARCHIVED: "warning",
};

export const statusLabels: Record<EventStatus, string> = {
  DRAFT: "Черновик",
  PENDING: "На модерации",
  PUBLISHED: "Опубликовано",
  REJECTED: "Отклонено",
  ARCHIVED: "В архиве",
};

export function EventEditor({
  event,
  userRole,
}: {
  event: EventWithCounts;
  userRole: UserRole;
}) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string>(event.description || "");
  const [slug, setSlug] = useState<string>(event.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(event.coverImage);
  const router = useRouter();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const canEdit =
    event.status === EventStatus.DRAFT ||
    event.status === EventStatus.REJECTED ||
    userRole.match(/ADMIN/);

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
    slug: string;
    city?: string;
    location?: string;
    format: EventFormat;
    type: EventType;
    startRegDate: dayjs.Dayjs;
    endRegDate: dayjs.Dayjs;
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
        format: values.format,
        type: values.type,
        city: values.city || null,
        location: values.location || null,
        coverImage: coverImage,
        startRegDate: values.startRegDate ? values.startRegDate.toDate() : null,
        endRegDate: values.endRegDate ? values.endRegDate.toDate() : null,
      });
      if (result.success) {
        message.success("Мероприятие сохранено");
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
    updateEvent(event.id, { coverImage: newCover });
  };

  const handlePublished = async () => {
    // Проверяем на наличие обложки
    if (!coverImage) {
      message.error("Добавьте обложку мероприятия");
      return;
    }
    // Проверяем на пустое описание
    if (!value || value.length < 10) {
      message.error("Добавьте или расширьте описание мероприятия");
      return;
    }

    setLoading(true);
    try {
      // Сначала сохраняем все изменения
      const values = await form.validateFields();
      await onFinish(values);

      // Затем отправляем на модерацию
      const result = await submitEvent(event.id);
      if (result.success) {
        message.success(
          result.data?.status === EventStatus.PUBLISHED
            ? "Мероприятие опубликовано"
            : "Мероприятие отправлено на модерацию",
        );
        router.push("/in/events/my");
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

  const hrIconStyle = {
    color: "#486284",
    size: 20,
  };

  const datePickerFormat = "DD.MM.YYYY HH:mm";

  return (
    <div className="flex gap-6">
      <div className="w-full max-w-180">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: event.title,
            slug: event.slug,
            type: event.type,
            city: event.city,
            location: event.location,
            format: event.format,
            startDate: dayjs(event.startDate),
            endDate: dayjs(event.endDate),
            startRegDate: event.startRegDate
              ? dayjs(event.startRegDate)
              : undefined,
            endRegDate: event.endRegDate ? dayjs(event.endRegDate) : undefined,
          }}
          onFinish={onFinish}
        >
          <div className="mb-10">
            <h3 className="mb-1 font-semibold">Обложка</h3>
            <EventCoverUploader
              currentCover={coverImage}
              onCoverChange={handleCoverChange}
              disabled={!canEdit}
            />
          </div>
          <HR icon={<Link {...hrIconStyle} />} title="Заголовок и адрес" />
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

          <HR icon={<CalendarCog {...hrIconStyle} />} title="Формат и тип" />
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Формат" name="format">
              <Select
                options={[
                  { value: "OFFLINE", label: "Оффлайн" },
                  { value: "ONLINE", label: "Онлайн" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Тип мероприятия" name="type">
              <Select
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
          </div>

          <HR icon={<MapPinHouse {...hrIconStyle} />} title="Локация" />
          <Form.Item label="Город" name="city">
            <Input size="large" disabled={!canEdit} placeholder="Москва" />
          </Form.Item>
          <Form.Item
            label="Место проведения"
            name="location"
            rules={[
              {
                required: true,
                message: "Укажите место проведения. Площадку, канал и т.д.",
              },
            ]}
          >
            <Input
              size="large"
              disabled={!canEdit}
              placeholder="Адрес или ссылка на трансляцию"
            />
          </Form.Item>

          <HR icon={<CalendarClock {...hrIconStyle} />} title="Время и Даты" />
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Дата и время начала"
              name="startDate"
              rules={[{ required: true, message: "Выберите дату начала" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format={datePickerFormat}
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
                format={datePickerFormat}
                disabled={!canEdit}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label="Начало регистрации"
              name="startRegDate"
              rules={[{ required: true, message: "Выберите дату" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format={datePickerFormat}
                disabled={!canEdit}
                style={{ width: "100%" }}
                placeholder="Выберите дату"
              />
            </Form.Item>

            <Form.Item
              label="Окончание регистрации"
              name="endRegDate"
              rules={[{ required: true, message: "Выберите дату" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format={datePickerFormat}
                disabled={!canEdit}
                style={{ width: "100%" }}
                placeholder="Выберите дату"
              />
            </Form.Item>
          </div>
        </Form>

        <HR icon={<CalendarRange {...hrIconStyle} />} title="Описание" />
        <div>
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
      </div>

      {/* Form controls */}
      <div className="relative w-55">
        <div className="sticky top-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Tag
              variant="solid"
              className="w-full text-center! text-lg!"
              color={statusColors[event.status]}
            >
              {statusLabels[event.status]}
            </Tag>
            {event.status === EventStatus.REJECTED && event.rejectionReason && (
              <span className="text-sm text-red-500">
                Причина: {event.rejectionReason}
              </span>
            )}
          </div>
          {canEdit && (
            <EventControls
              form={form}
              event={event}
              handlePublished={handlePublished}
              loading={loading}
            />
          )}
          <EventStats event={event} />
        </div>
      </div>
    </div>
  );
}

export function HR(props: { icon: React.ReactNode; title: string }) {
  return (
    <Divider titlePlacement="left" className="mt-10!">
      <Space>
        {props.icon} <span className="text-sm font-bold">{props.title}</span>
      </Space>
    </Divider>
  );
}
