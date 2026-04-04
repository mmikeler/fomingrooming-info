"use client";

import { useEffect, useRef, useState } from "react";
import { trackPostView } from "@/app/components/views/actions/views";

interface PostViewportTrackerProps {
  postId: number;
}

/**
 * Компонент для учёта просмотров в ленте
 * Регистрирует просмотр когда карточка находится в области видимости 10 секунд
 */
export default function PostViewportTracker({
  postId,
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
      { threshold: 0.5 },
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
        trackPostView(postId).catch(console.error);
      }, 10000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, postId, tracked]);

  return (
    <div ref={elementRef} style={{ display: "contents" }}>
      {/* Этот компонент ничего не рендерит, только отслеживает */}
    </div>
  );
}
