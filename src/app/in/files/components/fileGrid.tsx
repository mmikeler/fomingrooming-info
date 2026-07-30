"use client";

import { formatDate } from "@/app/components/ui/date";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { App, Button, Card, Modal, Tabs } from "antd";
import Image from "next/image";
import { useState } from "react";
import GalleryItem from "./galleryItem";
import { MediaFile, UserMediaResponse } from "../actions/getUserMediaFiles";
import GetUserMediaFiles from "../actions/getUserMediaFiles";
import FileUpload from "./fileUpload";
import { deleteImageAction } from "@/app/actions/upload-image";

export function FileGrid({
  self: initialSelf,
  shared: initialShared = [],
  userRole,
}: UserMediaResponse) {
  const [changedFile, setChangedFile] = useState<MediaFile | null>(null);
  const [self, setSelf] = useState<MediaFile[]>(initialSelf);
  const [shared, setShared] = useState<MediaFile[]>(initialShared);
  const [activeTab, setActiveTab] = useState<string>(
    initialSelf.length > 0 ? "self" : "shared",
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { message, modal } = App.useApp();

  const canDelete = (file: MediaFile) => {
    if (file.id.startsWith("shared-")) {
      return userRole === "SUPERADMIN";
    }
    return true;
  };

  const refreshFiles = async () => {
    setLoading(true);
    try {
      const data = await GetUserMediaFiles();
      setSelf(data.self);
      setShared(data.shared ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (self.length === 0 && shared.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">Нет файлов</p>
      </div>
    );
  }

  const showTabs = shared.length > 0;

  const renderGrid = (files: MediaFile[]) => (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {files.map((file) => (
        <GalleryItem key={file.id} file={file} action={setChangedFile} />
      ))}
    </div>
  );

  const handleDelete = async () => {
    if (!changedFile) return;

    modal.confirm({
      title: "Удалить файл?",
      content: `Вы уверены, что хотите удалить "${changedFile.name}"?`,
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: async () => {
        setDeleting(true);
        try {
          const result = await deleteImageAction(changedFile.url);
          if (result.success) {
            message.success("Файл удален");
            setChangedFile(null);
            await refreshFiles();
          } else {
            message.error(result.error || "Ошибка удаления");
          }
        } catch {
          message.error("Произошла ошибка при удалении");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const previewModal = (
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
        title={
          <div className="truncate" title={changedFile?.name}>
            {changedFile?.name}
          </div>
        }
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
          <div className="cursor-pointer" onClick={() => setChangedFile(null)}>
            <CloseOutlined />
          </div>
        }
        actions={
          changedFile && canDelete(changedFile)
            ? [
                <Button
                  key="delete"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting}
                  onClick={handleDelete}
                >
                  Удалить
                </Button>,
              ]
            : []
        }
      >
        <div className="flex flex-col gap-2">
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
  );

  if (!showTabs) {
    return (
      <>
        <FileUpload target="self" onSuccess={refreshFiles} />
        <div className="mt-4">{renderGrid(self)}</div>
        {previewModal}
      </>
    );
  }

  const tabItems = [
    {
      key: "self",
      label: "Мои файлы",
      children: (
        <>
          <FileUpload target="self" onSuccess={refreshFiles} />
          <div className="mt-4">{renderGrid(self)}</div>
        </>
      ),
    },
    {
      key: "shared",
      label: "Общие файлы",
      children: (
        <>
          <FileUpload target="shared" onSuccess={refreshFiles} />
          <div className="mt-4">{renderGrid(shared)}</div>
        </>
      ),
    },
  ];

  return (
    <>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      {previewModal}
    </>
  );
}
