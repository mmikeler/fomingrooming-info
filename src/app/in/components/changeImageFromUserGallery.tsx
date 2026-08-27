"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { App, Button, Drawer, Spin, Tabs } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import GetUserMediaFiles, {
  MediaFile,
  UserMediaResponse,
} from "@/app/in/files/actions/getUserMediaFiles";
import GalleryItem from "@/app/in/files/components/galleryItem";
import { FileGrid } from "../files/components/fileGrid";

/**
 * @description Компонент выводит кнопку, при нажатии открывается галлерея пользователя, где можно выбрать изображение. При выборе, url изображения передаётся в колбэк из пропсов.
 * @param props {callback: (url:string)=>void} - функция принимает на вход строку ссылки
 */

export default function ChangeImageFromUserGalleryButton({
  callback,
}: {
  callback: (imageURL: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UserMediaResponse>({ own: [] });
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await GetUserMediaFiles();
      setFiles(data);
    } catch {
      message.error("Не удалось загрузить файлы");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    loadFiles();
  };

  const handleFileSelect = (value: MediaFile) => {
    if (value) {
      callback(value.url);
      setOpen(false);
    }
  };

  return (
    <>
      <Button color="green" variant="solid" onClick={handleOpen}>
        Из галлереи
      </Button>

      <Drawer
        title="Выберите изображение из галлереи"
        open={open}
        onClose={() => setOpen(false)}
        size={640}
        footer={null}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadFiles}
            disabled={loading}
            size="small"
          >
            Обновить
          </Button>
        }
      >
        {loading ? (
          <Spin />
        ) : (
          <FileGrid {...files} changedAction={handleFileSelect} />
        )}
      </Drawer>
    </>
  );
}
