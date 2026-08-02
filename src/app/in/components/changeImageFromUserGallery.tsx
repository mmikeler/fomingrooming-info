"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { App, Button, Drawer, Spin, Tabs } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import GetUserMediaFiles, {
  MediaFile,
} from "@/app/in/files/actions/getUserMediaFiles";
import GalleryItem from "@/app/in/files/components/galleryItem";

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
  const [selfFiles, setSelfFiles] = useState<MediaFile[]>([]);
  const [sharedFiles, setSharedFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await GetUserMediaFiles();
      setSelfFiles(data.self);
      setSharedFiles(data.shared ?? []);
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

  const handleFileSelect: Dispatch<SetStateAction<MediaFile | null>> = (
    value,
  ) => {
    const file = typeof value === "function" ? value(selectedFile) : value;
    setSelectedFile(file);
    if (file) {
      callback(file.url);
      setOpen(false);
    }
  };

  const renderGrid = (gridFiles: MediaFile[]) => (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
      {gridFiles.map((file) => (
        <GalleryItem
          key={file.id}
          file={file}
          action={handleFileSelect}
        />
      ))}
    </div>
  );

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
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : selfFiles.length === 0 && sharedFiles.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Нет файлов</div>
        ) : (
          <Tabs
            items={[
              {
                key: "self",
                label: "Мои файлы",
                children: renderGrid(selfFiles),
              },
              ...(sharedFiles.length > 0
                ? [
                    {
                      key: "shared",
                      label: "Общие файлы",
                      children: renderGrid(sharedFiles),
                    },
                  ]
                : []),
            ]}
            defaultValue="self"
          />
        )}
      </Drawer>
    </>
  );
}
