"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date | string): TimeLeft | null {
  const difference = new Date(targetDate).getTime() - new Date().getTime();

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
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(targetDate),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <span className={`font-medium text-green-600 ${className}`}>
        Мероприятие началось!
      </span>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  // Форматирование для отображения
  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      <span className="font-semibold text-blue-600">⏱️</span>
      <span className="text-gray-600">
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
