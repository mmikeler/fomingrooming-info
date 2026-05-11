"use server";

import { FeedItem } from "@/app/in/lenta/types";
import { getRecommendations } from "./getRecommendations";
import { Divider } from "antd";
import Link from "next/link";
import { Quote } from "lucide-react";

/**
 * @description Компонент для отображения рекомендаций при просмотре контента
 * @argument {FeedItem} record - подготовленный элемент выдачи
 * @argument {number} limit - количество рекомендаций для отображения
 * @returns {JSX.Element}
 */

type RecommendationsProps = {
  record: FeedItem;
  limit: number;
};

export default async function Recommendations({
  record,
  limit = 2,
}: RecommendationsProps) {
  // Получаем рекомендованные записи
  const result = await getRecommendations(record, limit);

  // Если нет рекомендаций, возвращаем null
  if (!result.success || !result.data) return null;

  return (
    <>
      <Divider titlePlacement="center">Что ещё почитать</Divider>
      <div className="mt-5 flex flex-col gap-4 lg:flex-row">
        {result.data.map((post) => (
          <Link
            href={`/in/${record.category ? "posts" : "events"}/${post.slug}`}
            key={post.id}
            className="block w-full rounded border bg-white! px-5 py-3 text-center"
          >
            <div className="text-[16px]">
              <Quote size={14} color="gray" />
              {post.title}
            </div>
            <div className="mt-3 text-right text-[12px] text-gray-500">
              {post.author.name}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
