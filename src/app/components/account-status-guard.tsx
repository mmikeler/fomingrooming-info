"use client";

import { useSession } from "next-auth/react";
import { AccountStatus } from "../../generated/prisma/enums";
import { canCreateContent } from "../../lib/permissions";
import { redirect } from "next/navigation";

interface AccountStatusGuardProps {
  children: React.ReactNode;
  restrictedPaths?: string[];
}

/**
 * Component that protects pages from restricted users
 * Redirects to profile if user status is RESTRICTED or BANNED
 */
export function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  // Проверяем статус аккаунта
  const userStatus = session.user.status as AccountStatus;

  // Если пользователь ограничен или заблокирован, перенаправляем на профиль
  if (!canCreateContent(userStatus)) {
    redirect("/profile");
  }

  return <>{children}</>;
}

/**
 * Hook для проверки статуса аккаунта
 */
export function useAccountStatus() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return {
      isActive: false,
      isRestricted: false,
      isBanned: false,
      canCreateContent: false,
    };
  }

  const userStatus = session.user.status as AccountStatus;

  return {
    isActive: userStatus === AccountStatus.ACTIVE,
    isRestricted: userStatus === AccountStatus.RESTRICTED,
    isBanned: userStatus === AccountStatus.BANNED,
    canCreateContent: canCreateContent(userStatus),
    status: userStatus,
  };
}
