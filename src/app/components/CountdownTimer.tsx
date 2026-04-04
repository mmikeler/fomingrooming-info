"use client";

import React from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date | string | undefined;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(
  targetDate: CountdownTimerProps["targetDate"],
): TimeLeft | null {
  const now = Date.now();

  if (!targetDate) {
    return null;
  }

  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({
  targetDate,
  className = "",
}: CountdownTimerProps) {
  // Маркер для отслеживания гидратации
  const [hydrated, setHydrated] = React.useState(false);

  // Вычисляем время на клиенте после монтирования
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft | null>(null);

  React.useEffect(() => {
    setHydrated(true);
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Показываем одинаковый контент на сервере и до гидратации на клиенте
  // Это предотвращает ошибку гидратации
  if (!hydrated || !timeLeft) {
    return (
      <span
        className={`flex items-center gap-1 font-medium text-gray-400 ${className}`}
        suppressHydrationWarning
      >
        <span className="flex items-center">
          <Clock size={16} className="mr-1" />
        </span>
        Загрузка...
      </span>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  // Форматирование для отображения
  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      <span className="flex items-center">
        <Clock size={16} className="text-blue-600" />
      </span>
      <span className="flex items-center gap-2 text-gray-600">
        {days > 0 && (
          <span className="font-medium">
            {days} {days === 1 ? "день" : days < 5 ? "дня" : "дней"}
          </span>
        )}
        <span className="font-mono">
          {formatNumber(hours)}:{formatNumber(minutes)}:{formatNumber(seconds)}
        </span>
      </span>
    </div>
  );
}
