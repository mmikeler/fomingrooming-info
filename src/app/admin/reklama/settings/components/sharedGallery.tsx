"use client";
// Компонент, который позволяет загрузить, просмотреть и выбрать изображение из указанной папки

import { Flex, Image, Upload, Button, message, App } from "antd";
import { useEffect, useState, useRef } from "react";
import GetSharedFiles from "../actions/getSharedFiles";
import { MediaFile } from "@/app/in/files/components/fileGrid";
import { uploadImage } from "@/app/actions/upload-image";
import { UploadOutlined } from "@ant-design/icons";

type SharedGalleryProps = {
  onClick?: (src: string) => void;
};

export default function SharedGallery({ onClick }: SharedGalleryProps) {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef(null);
  const { message } = App.useApp();

  useEffect(() => {
    const getFiles = async () => {
      const files = await GetSharedFiles();
      setImages(files);
    };
    getFiles();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData, "shared");

      if (result.success && result.url) {
        message.success("Изображение успешно загружено");
        // Обновляем список изображений
        const updatedFiles = await GetSharedFiles();
        setImages(updatedFiles);
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
    <div className="">
      <Flex vertical gap="middle">
        <Upload
          ref={uploadRef}
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
          disabled={uploading}
        >
          <Button icon={<UploadOutlined />} loading={uploading} type="primary">
            Загрузить изображение
          </Button>
        </Upload>

        <Flex gap="small" wrap>
          {images.map((file, index) => {
            return (
              <div
                key={index}
                className="cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-80"
                onClick={() => onClick?.(file.url)}
              >
                <Image
                  style={{ objectFit: "cover" }}
                  src={file.url}
                  width={100}
                  height={100}
                  alt={file.name}
                />
              </div>
            );
          })}
        </Flex>
      </Flex>
    </div>
  );
}
