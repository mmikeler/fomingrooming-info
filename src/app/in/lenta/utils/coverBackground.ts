/**
 * Утилиты для обложек карточек
 */

/** Получить класс фона для обложки */
export function getCoverBackground(): string {
  return "bg-gradient-to-br from-blue-400 to-purple-500";
}

/** Получить класс фона для обложки в зависимости от статуса события */
export function getEventCoverBackground(
  status: "ongoing" | "upcoming" | "past",
): string {
  switch (status) {
    case "ongoing":
      return "bg-gradient-to-br from-green-400 to-emerald-500";
    case "upcoming":
      return "bg-gradient-to-br from-blue-400 to-purple-500";
    case "past":
      return "bg-gradient-to-br from-gray-400 to-gray-500";
    default:
      return "bg-gradient-to-br from-blue-400 to-purple-500";
  }
}
