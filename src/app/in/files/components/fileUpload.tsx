"use client";

import { useState } from "react";
import { Upload, Button, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadImage } from "@/app/actions/upload-image";
import { UploadType } from "@/lib/upload/file-storage";

type UploadTarget = Exclude<UploadType, "avatars">;

type FileUploadProps = {
  target: UploadTarget;
  onSuccess?: () => void;
};

const targetLabels: Record<UploadTarget, string> = {
  own: "Загрузить в личные",
  shared: "Загрузить в общие",
  banners: "Добавить к баннерам",
};

export default function FileUpload({ target, onSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { message } = App.useApp();

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData, target);

      if (result.success) {
        message.success("Файл успешно загружен");
        onSuccess?.();
      } else {
        message.error(result.error || "Ошибка загрузки");
      }
    } catch {
      message.error("Произошла ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      accept="image/*"
      showUploadList={false}
      beforeUpload={(file) => {
        handleUpload(file);
        return false;
      }}
      disabled={uploading}
    >
      <Button icon={<UploadOutlined />} loading={uploading} type="primary">
        {targetLabels[target]}
      </Button>
    </Upload>
  );
}
