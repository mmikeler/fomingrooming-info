import Image from "next/image";
import { MediaFile } from "./fileGrid";
import { Tooltip } from "antd";
import { Dispatch, SetStateAction } from "react";

export default function GalleryItem({
  file,
  action,
}: {
  file: MediaFile;
  action: Dispatch<SetStateAction<MediaFile | null>>;
}) {
  return (
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
        onClick={() => action(file)}
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
  );
}
