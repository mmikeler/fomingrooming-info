"use client";

import { useState, useRef } from "react";
import { Avatar, Button, message } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { uploadImage, deleteImageAction } from "@/app/actions/upload-image";
import Image from "next/image";
import Title from "antd/es/typography/Title";

interface AvatarUploaderProps {
  currentAvatar?: string | null;
  userName: string;
  onAvatarChange?: (newAvatar: string | null) => void;
}

export function AvatarUploader({
  currentAvatar,
  userName,
  onAvatarChange,
}: AvatarUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatar || null,
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

      const result = await uploadImage(formData, "avatar");

      if (result.success && result.url) {
        setPreviewUrl(result.url);
        message.success("Аватарка загружена");

        // Уведомляем родительский компонент
        if (onAvatarChange) {
          onAvatarChange(result.url);
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
        message.success("Аватарка удалена");

        // Уведомляем родительский компонент
        if (onAvatarChange) {
          onAvatarChange(null);
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
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/50">
            <LoadingOutlined className="text-2xl text-white" />
          </div>
        )}

        {previewUrl ? (
          <div className="relative h-37 w-37 overflow-hidden rounded-full">
            <Image
              src={previewUrl}
              alt="Аватар"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <Avatar
            size={150}
            style={{
              backgroundColor: "var(--foreground)",
              display: "flex",
            }}
          >
            <Title style={{ color: "white", margin: 0 }}>
              {userName?.[0]?.toUpperCase() || "?"}
            </Title>
          </Avatar>
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
          disabled={loading}
        >
          Загрузить
        </Button>

        {previewUrl && (
          <Button
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={loading}
            disabled={loading}
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
