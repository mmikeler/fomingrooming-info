"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "../../generated/prisma/enums";
import { hasPermission } from "../../lib/permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 */
export function RoleGuard({
  children,
  requiredRole,
  fallback = null,
}: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user?.role) {
    return <>{fallback}</>;
  }

  if (!hasPermission(session.user.role as UserRole, requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
interface WithRoleProps {
  requiredRole: UserRole;
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  { requiredRole }: WithRoleProps,
) {
  return function WithRoleComponent(props: P) {
    const { data: session, status } = useSession();

    if (status === "loading") {
      return <div>Загрузка...</div>;
    }

    if (!session?.user?.role) {
      return <div>Требуется авторизация</div>;
    }

    if (!hasPermission(session.user.role as UserRole, requiredRole)) {
      return <div>Недостаточно прав</div>;
    }

    return <Component {...props} />;
  };
}
