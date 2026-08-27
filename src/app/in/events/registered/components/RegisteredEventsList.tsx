"use client";

import Link from "next/link";

import PostCard from "@/app/components/post/postCard";
import { FeedItem } from "@/app/in/lenta/types";

export function RegisteredEventsList({ events }: { events: FeedItem[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4">У вас пока нет регистраций на мероприятия</p>
        <Link href="/events" className="text-blue-600 hover:underline">
          Посмотреть доступные мероприятия
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {events.map((event: FeedItem) => {
        return <PostCard key={event.id} post={event} />;
      })}
    </div>
  );
}
