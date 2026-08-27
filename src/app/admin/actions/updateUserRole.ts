"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAssignRole, canManageUsers } from "@/lib/permissions";
import { UserRole } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

interface UpdateUserRoleResult {
  success: boolean;
  error?: string;
}

/**
 * Update a user's role (ADMIN+ only)
 */
export async function updateUserRole(
  userId: number,
  newRole: UserRole,
): Promise<UpdateUserRoleResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!currentUser) {
      return { success: false, error: "Пользователь не найден" };
    }

    // Check if user can manage users
    if (!canManageUsers(currentUser.role)) {
      logger.warn("Unauthorized role update attempt", {
        currentUserId: currentUser.id,
        currentRole: currentUser.role,
        targetUserId: userId,
        targetRole: newRole,
      });
      return { success: false, error: "Недостаточно прав" };
    }

    // Check if user can assign this specific role
    if (!canAssignRole(currentUser.role, newRole)) {
      return { success: false, error: "Нельзя назначить эту роль" };
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "Целевой пользователь не найден" };
    }

    // Prevent changing role of users with higher or equal role
    if (currentUser.role !== "SUPERADMIN") {
      const { ROLE_HIERARCHY } = await import("@/lib/permissions");
      if (ROLE_HIERARCHY[targetUser.role] >= ROLE_HIERARCHY[currentUser.role]) {
        return {
          success: false,
          error: "Нельзя изменить роль этого пользователя",
        };
      }
    }

    // Update the role
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    logger.info("User role updated", {
      currentUserId: currentUser.id,
      targetUserId: userId,
      oldRole: targetUser.role,
      newRole,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    logger.error("Failed to update user role", { error, userId, newRole });
    return { success: false, error: "Ошибка при обновлении роли" };
  }
}

/**
 * Get all users (ADMIN+ only)
 */
export async function getUsers() {
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users;
  } catch (error) {
    logger.error("Failed to get users", { error });
    return [];
  }
}
