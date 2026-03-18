/**
 * TypeScript types for seed data
 */

import { EventType } from "@/generated/prisma/enums";

export interface SeedUser {
  /** Temporary ID for mapping posts to authors */
  id: number;
  email: string;
  name: string;
  /** Plain text password (will be hashed during seed) */
  password: string;
  /** Account status: ACTIVE, RESTRICTED, BANNED */
  status?: "ACTIVE" | "RESTRICTED" | "BANNED";
  /** Reason for restriction (when status is RESTRICTED) */
  restrictedReason?: string;
  /** When user was restricted */
  restrictedAt?: string;
  /** Who restricted the user */
  restrictedBy?: number;
  /** Reason for ban (when status is BANNED) */
  bannedReason?: string;
  /** When user was banned */
  bannedAt?: string;
  /** Who banned the user */
  bannedBy?: number;
}

export interface SeedPost {
  title: string;
  slug: string;
  content: string;
  published?: boolean;
  status?: string;
  /** Post category: NEWS or ARTICLE */
  category?: "NEWS" | "ARTICLE";
  rejectionReason?: string;
  moderatedAt?: string;
  moderatedBy?: number;
  /** Reference to SeedUser.id (temporary string ID) */
  authorId: string;
}

export interface SeedEvent {
  title: string;
  slug: string;
  description?: string;
  format: "ONLINE" | "OFFLINE";
  type?: EventType;
  city?: string;
  location?: string;
  startDate: string;
  endDate: string;
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

export interface SeedEventRegistration {
  /** Reference to event index in events.json (1-based) */
  eventIndex: number;
  /** Reference to SeedUser.id (temporary ID) */
  userId: number;
}
