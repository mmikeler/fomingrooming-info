import { getFeedItems } from "./actions/getFeedItems";
import FeedList from "./components/FeedList";

/**
 * Страница ленты новостей пользователя
 * Отображает опубликованные новости, статьи и мероприятия
 * С бесконечной прокруткой
 */
export default async function Page() {
  // Загружаем начальные данные
  const result = await getFeedItems({ limit: 10 });

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto max-w-180 px-4 py-8">
        <div className="text-gray-500">Не удалось загрузить ленту</div>
      </div>
    );
  }

  const { items, hasMore, nextCursor } = result.data;

  return (
    <div className="container mx-auto max-w-180 px-4 py-8">
      <FeedList
        initialItems={items}
        initialHasMore={hasMore}
        initialNextCursor={nextCursor}
      />
    </div>
  );
}
