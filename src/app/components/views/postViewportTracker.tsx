"use client";

import { useEffect, useRef, useState } from "react";
import { trackPostView } from "@/app/components/views/actions/views";
import { FeedItemType } from "@/app/in/lenta/types";

interface PostViewportTrackerProps {
  postId: number;
  postType: FeedItemType;
  children: React.ReactNode;
}

/**
 * Компонент для учёта просмотров в ленте
 * Регистрирует просмотр когда карточка находится в области видимости 10 секунд
 */
export default function PostViewportTracker({
  postId,
  postType = "POST",
  children,
}: PostViewportTrackerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tracked, setTracked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tracked) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 1, rootMargin: "0px" },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [tracked]);

  useEffect(() => {
    if (!tracked && isVisible) {
      // Начинаем отсчёт 10 секунд видимости
      timerRef.current = setTimeout(() => {
        setTracked(true);
        trackPostView(postId, postType).catch(console.error);
      }, 10000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, postId, tracked]);

  return <div ref={elementRef}>{children}</div>;
}
