// EVENT types

import { Event } from "@/generated/prisma/client";

export interface EventWithCounts extends Event {
  _count: {
    registrations: number;
    favorites: number;
    likes: number;
    views: number;
  };
}
