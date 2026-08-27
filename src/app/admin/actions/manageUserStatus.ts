"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers, ROLE_HIERARCHY } from "@/lib/permissions";
import { AccountStatus, BanAction, UserRole } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

interface ManageUserStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Проверяет, может ли текущий пользователь управлять статусом целевого пользователя
 */
async function checkPermissions(
  currentUserId: number,
  targetUserId: number,
  targetUserRole: UserRole,
): Promise<{ allowed: boolean; error?: string }> {
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!currentUser) {
    return { allowed: false, error: "Пользователь не найден" };
  }

  // Проверка права на управление пользователями
  if (!canManageUsers(currentUser.role)) {
    return { allowed: false, error: "Недостаточно прав" };
  }

  // Нельзя управлять самим собой
  if (currentUserId === targetUserId) {
    return { allowed: false, error: "Нельзя изменить свой статус" };
  }

  // Нельзя управлять пользователями с равной или выше ролью
  if (currentUser.role !== "SUPERADMIN") {
    if (ROLE_HIERARCHY[targetUserRole] >= ROLE_HIERARCHY[currentUser.role]) {
      return {
        allowed: false,
        error: "Нельзя изменить статус пользователя с равной или выше ролью",
      };
    }
  }

  return { allowed: true };
}

/**
 * Логирует изменение статуса пользователя
 */
async function logStatusChange(
  userId: number,
  moderatorId: number,
  action: BanAction,
  reason: string | null,
  previousStatus: string | null,
) {
  await prisma.userBanLog.create({
    data: {
      userId,
      moderatorId,
      action,
      reason,
      previousValue: previousStatus,
    },
  });
}

/**
 * Ограничивает пользователя (RESTRICTED)
 * - Пользователь может войти в систему
 * - Пользователь НЕ может публиковать посты и события
 */
export async function restrictUser(
  userId: number,
  reason: string,
): Promise<ManageUserStatusResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const currentUserId = parseInt(session.user.id);

    // Получаем целевого пользователя
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "Пользователь не найден" };
    }

    // Проверяем права
    const { allowed, error } = await checkPermissions(
      currentUserId,
      userId,
      targetUser.role,
    );

    if (!allowed) {
      return { success: false, error };
    }

    // Если пользователь уже заблокирован (BANNED), сначала нужно его разблокировать
    if (targetUser.status === "BANNED") {
      return {
        success: false,
        error: "Пользователь заблокирован. Сначала снимите блокировку.",
      };
    }

    // Если пользователь уже в статусе RESTRICTED
    if (targetUser.status === "RESTRICTED") {
      return { success: false, error: "Пользователь уже ограничен" };
    }

    const previousStatus = targetUser.status;

    // Устанавливаем статус RESTRICTED
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: AccountStatus.RESTRICTED,
          restrictedReason: reason,
          restrictedAt: new Date(),
          restrictedBy: currentUserId,
        },
      }),
      prisma.userBanLog.create({
        data: {
          userId,
          moderatorId: currentUserId,
          action: BanAction.RESTRICTED,
          reason,
          previousValue: previousStatus,
        },
      }),
    ]);

    logger.info("User restricted", {
      targetUserId: userId,
      moderatorId: currentUserId,
      reason,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error("Failed to restrict user", { error, userId, reason });
    return { success: false, error: "Ошибка при ограничении пользователя" };
  }
}

/**
 * Блокирует пользователя (BANNED)
 * - Пользователь НЕ может войти в систему
 * - Все действия заблокированы
 */
export async function banUser(
  userId: number,
  reason: string,
): Promise<ManageUserStatusResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const currentUserId = parseInt(session.user.id);

    // Получаем целевого пользователя
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "Пользователь не найден" };
    }

    // Проверяем права
    const { allowed, error } = await checkPermissions(
      currentUserId,
      userId,
      targetUser.role,
    );

    if (!allowed) {
      return { success: false, error };
    }

    // SUPERADMIN может заблокировать только ADMIN и ниже
    const currentUserForBanCheck = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });
    if (currentUserForBanCheck?.role !== "SUPERADMIN") {
      if (targetUser.role === "SUPERADMIN") {
        return {
          success: false,
          error: "Нельзя заблокировать суперадминистратора",
        };
      }
    }

    // Если пользователь уже заблокирован
    if (targetUser.status === "BANNED") {
      return { success: false, error: "Пользователь уже заблокирован" };
    }

    const previousStatus = targetUser.status;

    // Устанавливаем статус BANNED
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: AccountStatus.BANNED,
          banReason: reason,
          bannedAt: new Date(),
          bannedBy: currentUserId,
        },
      }),
      prisma.userBanLog.create({
        data: {
          userId,
          moderatorId: currentUserId,
          action: BanAction.BANNED,
          reason,
          previousValue: previousStatus,
        },
      }),
    ]);

    logger.info("User banned", {
      targetUserId: userId,
      moderatorId: currentUserId,
      reason,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error("Failed to ban user", { error, userId, reason });
    return { success: false, error: "Ошибка при блокировке пользователя" };
  }
}

/**
 * Снимает ограничения с пользователя (ACTIVE)
 * - Возвращает пользователю полный доступ
 */
export async function unbanUser(
  userId: number,
): Promise<ManageUserStatusResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const currentUserId = parseInt(session.user.id);

    // Получаем целевого пользователя
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "Пользователь не найден" };
    }

    // Проверяем права
    const { allowed, error } = await checkPermissions(
      currentUserId,
      userId,
      targetUser.role,
    );

    if (!allowed) {
      return { success: false, error };
    }

    // Если пользователь уже активен
    if (targetUser.status === "ACTIVE") {
      return { success: false, error: "Пользователь уже активен" };
    }

    const previousStatus = targetUser.status;

    // Определяем тип предыдущего ограничения для логирования
    const action =
      previousStatus === "BANNED" ? BanAction.UNBANNED : BanAction.UNRESTRICTED;

    // Снимаем ограничения
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: AccountStatus.ACTIVE,
          // Очищаем поля блокировки
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          // Очищаем поля ограничения
          restrictedReason: null,
          restrictedAt: null,
          restrictedBy: null,
        },
      }),
      prisma.userBanLog.create({
        data: {
          userId,
          moderatorId: currentUserId,
          action,
          reason: null,
          previousValue: previousStatus,
        },
      }),
    ]);

    logger.info("User unbanned", {
      targetUserId: userId,
      moderatorId: currentUserId,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error("Failed to unban user", { error, userId });
    return { success: false, error: "Ошибка при разблокировке пользователя" };
  }
}

/**
 * Получает историю блокировок пользователя
 */
export async function getUserBanHistory(userId: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return [];
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!currentUser || !canManageUsers(currentUser.role)) {
      return [];
    }

    const logs = await prisma.userBanLog.findMany({
      where: { userId },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return logs;
  } catch (error) {
    logger.error("Failed to get user ban history", { error, userId });
    return [];
  }
}
