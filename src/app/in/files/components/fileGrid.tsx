"use client";

import { formatDate } from "@/app/components/ui/date";
import { CloseCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { Card, Modal, Tooltip } from "antd";
import Image from "next/image";
import { useState } from "react";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
}

interface FileGridProps {
  files: MediaFile[];
}

export function FileGrid({ files }: FileGridProps) {
  const [changedFile, setChangedFile] = useState<MediaFile | null>(null);

  if (files.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">Нет файлов</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {files.map((file) => (
          <Tooltip
            key={file.id}
            title={
              <>
                <div className="mt-2 text-sm">{file.name}</div>
                <div className="text-xs text-gray-100">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </>
            }
          >
            <div
              onClick={() => setChangedFile(file)}
              className="group relative cursor-pointer"
            >
              <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <Image
                  src={file.url}
                  alt={file.name}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      <Modal
        open={!!changedFile}
        onCancel={() => setChangedFile(null)}
        closable={false}
        footer={null}
        styles={{
          container: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        <Card
          title={changedFile?.name}
          cover={
            changedFile && (
              <div className="relative h-64">
                <Image
                  fill
                  src={changedFile.url}
                  style={{ objectFit: "contain" }}
                  alt=""
                />
              </div>
            )
          }
          extra={
            <div
              className="cursor-pointer"
              onClick={() => setChangedFile(null)}
            >
              <CloseOutlined />
            </div>
          }
          actions={["Удалить"]}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Название</span>
              <span>{changedFile?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Размер</span>
              <span>
                {changedFile?.size
                  ? (changedFile.size / 1024 / 1024).toFixed(2) + "MB"
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Тип файла</span>
              <span>{changedFile?.type}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Дата добавления</span>
              <span>
                {changedFile?.createdAt
                  ? formatDate(changedFile?.createdAt)
                  : "-"}
              </span>
            </div>
          </div>
        </Card>
      </Modal>
    </>
  );
}
