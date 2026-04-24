"use client";

import { ADV } from "@/generated/prisma/client";
import { App, Drawer, Image, Tooltip } from "antd";
import { useState } from "react";
import { updateADV } from "../actions/adv";
import { ImagePlus } from "lucide-react";
import SharedGallery from "./sharedGallery";

//

export function ADV_ITEM_IMAGE({ adv }: { adv: ADV }) {
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();
  const { src } = adv;

  const handleChangeImage = async (newSrc: string) => {
    // Basic URL validation for image source
    if (!newSrc || !newSrc.startsWith("/uploads")) {
      message.error({
        content: "Выберите корректное изображение",
      });
      return;
    }

    const res = await updateADV({ ...adv, src: newSrc });

    if (res !== undefined && !res.success) {
      message.error({
        content: "Ошибка при обновлении изображения",
      });
    } else {
      message.success({
        content: "Изображение успешно обновлено",
      });
    }

    setOpen(false);
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex h-full w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-gray-50"
      >
        {src.length > 0 ? (
          <div className="relative h-full w-full">
            <Image
              width={"100%"}
              height={"100%"}
              style={{ objectFit: "cover" }}
              src={src}
              alt=""
              preview={false}
            />
            <div className="absolute top-1 right-1 rounded-full border border-gray-300 bg-gray-50 p-1">
              <ImagePlus color="gray" size={20} />
            </div>
          </div>
        ) : (
          <Tooltip title="Добавить изображение">
            <ImagePlus color="gray" size={50} opacity={0.5} />
          </Tooltip>
        )}
      </div>
      <Drawer
        open={open}
        closable={true}
        onClose={() => setOpen(false)}
        destroyOnHidden={true}
        size={690}
      >
        <SharedGallery onClick={handleChangeImage} />
      </Drawer>
    </>
  );
}
