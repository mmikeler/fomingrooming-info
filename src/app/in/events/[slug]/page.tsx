// Universal single-post page

import { notFound } from "next/navigation";
import PostCard from "@/app/components/post/postCard";
import { Metadata } from "next";

import {
  generateContentMetadata,
  type PostMetadataInput,
} from "@/lib/metadata";
import {
  getFeedItem,
  getPublishedEvent,
} from "@/app/in/lenta/actions/getFeedItem";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Пробуем найти мероприятие
  const eventResult = await getPublishedEvent(slug);

  if (eventResult.success && eventResult.data) {
    const event = eventResult.data;

    const metadataInput: PostMetadataInput = {
      title: event.title,
      slug: event.slug,
      description: event.description,
      coverImage: event.coverImage,
      format: event.format,
      eventType: event.eventType,
      city: event.city,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      registrationsCount: event.registrationsCount,
      author: event.author,
    };

    return generateContentMetadata({
      data: metadataInput,
      type: "EVENT",
    });
  }

  return {};
}

export default async function SingleEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Пробуем найти мероприятие
  const eventResult = await getFeedItem({ idOrSlug: slug, type: "EVENT" });

  if (eventResult.success && eventResult.data) {
    const event = eventResult.data;

    return (
      <div className="container mx-auto min-h-[calc(100dvh-130px)] max-w-185 p-6">
        <PostCard post={event} isPreview={false} />
      </div>
    );
  }

  // Ничего не найдено
  notFound();
}
