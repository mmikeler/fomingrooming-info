"use client";

import { useState } from "react";
import { Upload, Button, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadMediaFile } from "../actions/uploadMediaFile";

type UploadTarget = "self" | "shared";

type FileUploadProps = {
  target: UploadTarget;
  onSuccess?: () => void;
};

const targetLabels: Record<UploadTarget, string> = {
  self: "Загрузить в личные",
  shared: "Загрузить в общие",
};

export default function FileUpload({ target, onSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { message } = App.useApp();

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadMediaFile(formData, target);

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
