/** Форматирование даты */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Форматирование даты события */
export function formatEventDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Форматирование даты (краткий формат для таблиц) */
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Форматирование даты с названиями месяцев */
export function formatDateWithMonthName(date: Date | string): string {
  const d = new Date(date);
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Высчитываем продолжительность */
export function eventDatesRange(
  start: Date | string,
  end: Date | string,
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 24) {
    // Менее суток - показываем в часах
    const hours = Math.round(diffHours);
    if (hours === 1) return "1 час";
    if (hours >= 2 && hours <= 4) return `${hours} часа`;
    return `${hours} часов`;
  }

  // Более суток - показываем в днях
  const days = Math.floor(diffDays);
  const remainingHours = Math.round((diffDays - days) * 24);

  if (days === 1) {
    if (remainingHours > 0) {
      return `1 день ${remainingHours} ч.`;
    }
    return "1 день";
  }

  if (days >= 2 && days <= 4) {
    if (remainingHours > 0) {
      return `${days} дня ${remainingHours} ч.`;
    }
    return `${days} дня`;
  }

  if (remainingHours > 0) {
    return `${days} дней ${remainingHours} ч.`;
  }
  return `${days} дней`;
}
