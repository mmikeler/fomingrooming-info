// Компонент сокращённой карточки для постов и мероприятий

import { Event, Post } from "@/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";

export function ShortCard({ record }: { record: Post | Event }) {
  return (
    <Link
      key={record.id}
      href={`/in/posts/${record.slug}`}
      className="group block overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
    >
      {record.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            fill
            src={record.coverImage}
            alt={record.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-blue-600">
          {record.title}
        </h3>
        <p className="text-sm text-gray-500">
          {new Date(record.created).toLocaleDateString("ru-RU")}
        </p>
      </div>
    </Link>
  );
}
