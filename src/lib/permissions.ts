import { UserRole, AccountStatus } from "../generated/prisma/enums";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  AUTHOR: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPERADMIN: 4,
} as const;

/**
 * Check if a user has permission based on their role
 */
export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can publish posts directly (without moderation)
 */
export function canPublishDirectly(role: UserRole): boolean {
  return hasPermission(role, "AUTHOR");
}

/**
 * Check if user can moderate posts
 */
export function canModerate(role: UserRole): boolean {
  return hasPermission(role, "MODERATOR");
}

/**
 * Check if user can manage other users (change roles)
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, "ADMIN");
}

/**
 * Check if user has full control over the system
 */
export function hasFullControl(role: UserRole): boolean {
  return role === "SUPERADMIN";
}

/**
 * Check if account status allows login
 */
export function canLogin(status: AccountStatus): boolean {
  return status !== AccountStatus.BANNED;
}

/**
 * Check if account status allows creating content (posts, events)
 */
export function canCreateContent(status: AccountStatus): boolean {
  return status === AccountStatus.ACTIVE;
}

/**
 * Check if user account is active
 */
export function isAccountActive(status: AccountStatus): boolean {
  return status === AccountStatus.ACTIVE;
}

/**
 * Get all roles that a user with given role can assign
 */
export function getAssignableRoles(role: UserRole): UserRole[] {
  const roles: UserRole[] = [
    "USER",
    "AUTHOR",
    "MODERATOR",
    "ADMIN",
    "SUPERADMIN",
  ];
  const roleLevel = ROLE_HIERARCHY[role];

  // Can only assign roles lower than own role
  // SUPERADMIN can assign any role except SUPERADMIN
  if (role === "SUPERADMIN") {
    return roles.filter((r) => r !== "SUPERADMIN");
  }

  // ADMIN can assign up to MODERATOR
  if (role === "ADMIN") {
    return roles.filter(
      (r) => ROLE_HIERARCHY[r] <= ROLE_HIERARCHY["MODERATOR"],
    );
  }

  return [];
}

/**
 * Check if user can assign a specific role
 */
export function canAssignRole(
  assignerRole: UserRole,
  targetRole: UserRole,
): boolean {
  const assignableRoles = getAssignableRoles(assignerRole);
  return assignableRoles.includes(targetRole);
}
