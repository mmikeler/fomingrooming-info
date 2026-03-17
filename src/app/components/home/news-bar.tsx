import { ArrowUpOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import Link from "next/link";
import { Suspense } from "react";
import { getNewsPosts, type NewsPost } from "./actions/getNewsPosts";
import { getExcerpt } from "../ui/excerpt";

/**
 * Скелетон для загрузки новостей
 */
function NewsSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div className="mt-5 border-b pb-5" key={i}>
          <Skeleton.Input active size="small" className="w-3/4" />
          <Skeleton.Input active size="small" className="mt-2 w-full" />
          <Skeleton.Input active size="small" className="mt-2 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Компонент для отображения списка новостей
 * @param categories - массив категорий для фильтрации (по умолчанию ["NEWS"])
 * @param count - количество постов (по умолчанию 8)
 */
async function NewsList({
  categories = ["NEWS"],
  count = 8,
}: {
  categories?: string[];
  count?: number;
}) {
  const result = await getNewsPosts(categories, count);

  if (!result.success) {
    return (
      <div className="mt-5 border-b pb-5 text-red-500">
        Ошибка загрузки новостей
      </div>
    );
  }

  const news = result.data;

  if (news.length === 0) {
    return (
      <div className="mt-5 border-b pb-5 text-stone-500">Новостей пока нет</div>
    );
  }

  return (
    <>
      {news.map((item: NewsPost) => {
        // Берем первый абзац контента как превью
        const excerpt = getExcerpt(item.content);

        return (
          <div className="mt-5 border-b pb-5" key={item.id}>
            <Link
              href={`/blog/${item.slug}`}
              className="relative block pr-4 font-bold text-(--foreground)!"
            >
              {item.title}
              <div className="absolute top-0 right-0">
                <ArrowUpOutlined className="rotate-45" />
              </div>
            </Link>
            <div className="mt-1">{excerpt}</div>
            <div className="mt-3">
              {new Date(item.created).toLocaleDateString("ru-RU")}
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * Компонент новостей с Suspense
 * @param categories - массив категорий для фильтрации (по умолчанию ["NEWS"])
 * @param count - количество постов (по умолчанию 8)
 */
export default function NEWS_BAR({
  categories,
  count,
}: {
  categories?: string[];
  count?: number;
}) {
  return (
    <Suspense fallback={<NewsSkeleton />}>
      <NewsList categories={categories} count={count} />
    </Suspense>
  );
}
