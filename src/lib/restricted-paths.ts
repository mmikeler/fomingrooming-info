/**
 * Конфигурация путей, доступ к которым ограничивается при статусе RESTRICTED
 *
 * При установке статуса RESTRICTED пользователь не сможет получить доступ
 * к этим маршрутам и связанным с ними действиям.
 */

export const RESTRICTED_PATHS = [
  "/profile/posts",
  "/profile/events/my",
] as const;

export type RestrictedPath = (typeof RESTRICTED_PATHS)[number];

/**
 * Проверяет, является ли путь защищённым
 */
export function isRestrictedPath(path: string): boolean {
  return RESTRICTED_PATHS.some((restrictedPath) =>
    path.startsWith(restrictedPath),
  );
}

/**
 * Проверяет, может ли пользователь создавать контент
 * на основе списка защищённых путей
 */
export function getRestrictedPaths(): readonly string[] {
  return RESTRICTED_PATHS;
}
