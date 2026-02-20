/**
 * TypeScript types for seed data
 */

export interface SeedUser {
  /** Temporary ID for mapping posts to authors */
  id: number;
  email: string;
  name: string;
  /** Plain text password (will be hashed during seed) */
  password: string;
}

export interface SeedPost {
  title: string;
  slug: string;
  content: string;
  published?: boolean;
  status?: string;
  rejectionReason?: string;
  moderatedAt?: string;
  moderatedBy?: number;
  /** Reference to SeedUser.id (temporary string ID) */
  authorId: string;
}

export interface SeedNotification {
  /** Reference to SeedUser.id (temporary ID) */
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
}

export interface SeedModerationLog {
  /** Reference to post index in posts.json (1-based) */
  postIndex: number;
  /** Reference to SeedUser.id (temporary ID) */
  moderatorId: number;
  oldStatus: string;
  newStatus: string;
  reason?: string;
}

// Future expansion types

export interface SeedCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SeedTag {
  id: string;
  name: string;
  slug: string;
}
