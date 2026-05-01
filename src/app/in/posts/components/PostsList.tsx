"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Spin, Empty } from "antd";
import {
  getPublishedPosts,
  type PublishedPost,
} from "../actions/getPublishedPosts";
import { PostsFiltersPanel } from "./PostsFiltersPanel";
import type { PostFilters } from "./PostsFiltersPanel";
import PostCard from "@/app/components/post/postCard";
import type { FeedItem } from "@/app/in/lenta/actions/getFeedItems";
import ADS from "@/app/components/ads/ads";

/**
 * Преобразование PublishedPost в формат для PostCard
 */
function transformPostForCard(post: PublishedPost): FeedItem {
  return {
    id: post.id,
    type: "POST",
    title: post.title,
    slug: post.slug,
    description: post.content,
    coverImage: post.coverImage,
    date: post.created,
    author: post.author,
    content: post.content,
    category: post.category,
    isFavorite: false,
    isLiked: false,
    likesCount: 0,
    viewsCount: 0,
    isAuthor: false,
  };
}

/**
 * Скелетон загрузки для списка постов
 */
function PostListSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-10 w-full rounded bg-gray-200" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-4 h-48 rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}

/**
 * Компонент списка опубликованных постов с фильтрацией
 */
export default function PostsList() {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PostFilters>({
    category: null,
    search: null,
  });
  const observerRef = useRef<HTMLDivElement>(null);

  // Частота размещения рекламы
  const AD_FREQUENCY = 3; // Размещать каждые 3 поста

  // Загрузка начальных данных
  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Перезагрузка при изменении фильтров
  useEffect(() => {
    if (!initialLoading) {
      loadPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadPosts = async (
    cursorParam?: number | null,
    forceFilters?: PostFilters,
  ) => {
    if (loading || (!cursorParam && !hasMore)) return;

    setLoading(true);
    setError(null);

    const currentFilters = forceFilters ?? filters;

    try {
      const result = await getPublishedPosts({
        cursor: cursorParam ?? undefined,
        filters: {
          category: currentFilters.category,
          search: currentFilters.search,
        },
      });

      if (result.success && result.data) {
        const { posts: newPosts, nextCursor, hasMore: more } = result.data;

        if (cursorParam) {
          // Дополнительная загрузка
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          // Начальная загрузка или сброс при фильтрации
          setPosts(newPosts);
        }

        setCursor(nextCursor);
        setHasMore(more);
      } else if (!result.success) {
        setError(result.error?.message ?? "Ошибка при загрузке постов");
      }
    } catch (err) {
      setError("Произошла ошибка при загрузке постов");
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleFilterChange = (newFilters: PostFilters) => {
    setFilters(newFilters);
    setCursor(null);
    setHasMore(true);
    loadPosts(null, newFilters);
  };

  // Observer для бесконечной прокрутки
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && cursor) {
        loadPosts(cursor, filters);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasMore, loading, cursor, filters],
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  // Начальная загрузка
  if (initialLoading) {
    return (
      <div>
        <PostsFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <PostListSkeleton />
      </div>
    );
  }

  // Ошибка при начальной загрузке
  if (error && posts.length === 0) {
    return (
      <div>
        <PostsFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <div className="py-12 text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={() => loadPosts()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Пустой список
  if (!initialLoading && posts.length === 0) {
    return (
      <div>
        <PostsFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <Empty
          description="Нет постов, соответствующих выбранным фильтрам"
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div>
      {/* Панель фильтров */}
      <PostsFiltersPanel
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Список постов в виде карточек */}
      <div className="flex flex-col gap-5">
        {posts.map((post, index) => (
          <Fragment key={post.id}>
            <PostCard post={transformPostForCard(post)} />
            {/* Рекламное место */}
            {index % AD_FREQUENCY === 0 && (
              <ADS place="POSTS" className="h-50 w-full" />
            )}
          </Fragment>
        ))}
      </div>

      {/* Индикатор загрузки */}
      {hasMore && (
        <div ref={observerRef} className="mt-8 flex justify-center py-4">
          {loading && <Spin size="large" />}
        </div>
      )}

      {/* Кнопка загрузки следующей страницы (fallback) */}
      {!loading && hasMore && cursor && (
        <div className="mt-8 text-center">
          <button
            onClick={() => loadPosts(cursor, filters)}
            className="rounded-lg bg-gray-100 px-6 py-2 text-gray-600 hover:bg-gray-200"
          >
            Загрузить ещё
          </button>
        </div>
      )}

      {/* Конец списка */}
      {!hasMore && posts.length > 0 && (
        <p className="mt-8 text-center text-gray-500">Все посты загружены</p>
      )}
    </div>
  );
}
