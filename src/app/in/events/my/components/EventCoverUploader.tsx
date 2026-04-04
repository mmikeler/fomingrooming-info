"use client";

import { useState, useRef } from "react";
import { Button, message } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { uploadImage, deleteImageAction } from "@/app/actions/upload-image";
import Image from "next/image";

interface EventCoverUploaderProps {
  currentCover?: string | null;
  onCoverChange?: (newCover: string | null) => void;
  disabled?: boolean;
}

export function EventCoverUploader({
  currentCover,
  onCoverChange,
  disabled = false,
}: EventCoverUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentCover || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      message.error("Пожалуйста, выберите изображение");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData, "event-cover");

      if (result.success && result.url) {
        setPreviewUrl(result.url);
        message.success("Обложка загружена");

        // Уведомляем родительский компонент
        if (onCoverChange) {
          onCoverChange(result.url);
        }
      } else {
        message.error(result.error || "Ошибка при загрузке");
      }
    } catch (error) {
      message.error("Ошибка при загрузке файла");
    } finally {
      setLoading(false);
      // Очищаем input для повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!previewUrl) return;

    setLoading(true);
    try {
      const result = await deleteImageAction(previewUrl);

      if (result.success) {
        setPreviewUrl(null);
        message.success("Обложка удалена");

        // Уведомляем родительский компонент
        if (onCoverChange) {
          onCoverChange(null);
        }
      } else {
        message.error(result.error || "Ошибка при удалении");
      }
    } catch (error) {
      message.error("Ошибка при удалении файла");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="w-full">
        {previewUrl ? (
          <div className="relative h-[200px] w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={previewUrl}
              alt="Обложка мероприятия"
              fill
              className="object-cover"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <LoadingOutlined className="text-2xl text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <span className="text-gray-400">Обложка не установлена</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          icon={<UploadOutlined />}
          onClick={handleClick}
          loading={loading}
          disabled={disabled || loading}
        >
          {previewUrl ? "Заменить" : "Загрузить"}
        </Button>

        {previewUrl && (
          <Button
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={loading}
            disabled={disabled || loading}
            danger
          >
            Удалить
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        JPEG, PNG, GIF, WebP. Максимум 5MB.
      </p>
    </div>
  );
}
