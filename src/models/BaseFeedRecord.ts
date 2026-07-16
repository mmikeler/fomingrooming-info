// Base class for all feed records

import { FeedItemType } from "@/app/in/lenta/types";
import { Event, Post, PostStatus, User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Author = {
  id: User["id"];
  slug: User["slug"];
  name: User["name"];
  avatar: User["avatar"];
  description: User["description"];
};

type Counts = {
  likes: number;
  favorites: number;
};

export type InitialPost = Post & { author: Author; __counts: Counts };
export type InitialEvent = Event & { author: Author; __counts: Counts };

export type RecordInitialModels = InitialPost | InitialEvent;

export default class BaseFeedRecord {
  type: FeedItemType;
  id: number;
  title: string;
  slug: string;
  created: Date;
  status: PostStatus;
  coverImage: string | null;
  excerpt: string | null;
  moderatedAt: Date | null;
  moderatedBy: number | null;
  rejectionReason: string | null;
  author: Author;
  counts: {
    likes: number;
    views: number;
    favorites: number;
  };
  permalink: string;

  constructor(r: RecordInitialModels) {
    this.type = "startDate" in r ? "EVENT" : "POST";
    this.id = r.id;
    this.title = r.title;
    this.slug = r.slug;
    this.created = r.created;
    this.status = r.status;
    this.coverImage = r.coverImage;
    this.excerpt = "excerpt" in r ? r.excerpt : r.description;
    this.moderatedAt = r.moderatedAt;
    this.moderatedBy = r.moderatedBy;
    this.rejectionReason = r.rejectionReason;
    this.author = {
      id: r.id,
      slug: r.author.slug,
      name: r.author.name,
      avatar: r.author.avatar,
      description: r.author.description,
    };
    this.counts = {
      likes: r.__counts.likes,
      views: r.viewsCount,
      favorites: r.__counts.favorites,
    };
    this.permalink = `/in/${this.type.toLowerCase() + "s"}/${this.slug}`;
  }

  // RECORD STATUS
  isDraft(): boolean {
    return this.status === PostStatus.DRAFT;
  }
  isPending(): boolean {
    return this.status === PostStatus.PENDING;
  }
  isRejected(): boolean {
    return this.status === PostStatus.REJECTED;
  }
  isPublished(): boolean {
    return this.status === PostStatus.PUBLISHED;
  }
  isArchived(): boolean {
    return this.status === PostStatus.ARCHIVED;
  }

  // Update method
  async updateMeta(data: Partial<Post | Event>) {
    try {
      // Update the post
      if (this.type === "POST") {
        const result = await prisma.post.update({
          where: { id: this.id },
          data,
        });
        return result;
      }
      // Update event
      if (this.type === "EVENT") {
        const result = await prisma.event.update({
          where: { id: this.id },
          data,
        });
        return result;
      }
    } catch (error) {
      return { error };
    }
  }
}
