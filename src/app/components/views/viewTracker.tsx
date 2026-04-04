"use client";

import { useEffect, useRef, useState } from "react";
import { trackPostView } from "@/app/components/views/actions/views";

interface ViewTrackerProps {
  postId: number;
}

/**
 * Компонент для учёта просмотров при загрузке страницы
 * Регистрирует просмотр после 10 секунд нахождения на странице
 */
export default function ViewTracker({ postId }: ViewTrackerProps) {
  const [tracked, setTracked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Регистрируем просмотр после 10 секунд
    timerRef.current = setTimeout(() => {
      if (!tracked) {
        setTracked(true);
        trackPostView(postId).catch(console.error);
      }
    }, 10000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [postId, tracked]);

  return null;
}
