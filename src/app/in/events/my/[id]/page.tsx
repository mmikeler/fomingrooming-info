import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EventEditor } from "./components/EventEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventEditPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const eventId = parseInt(id, 10);

  if (isNaN(eventId)) {
    notFound();
  }

  // Получаем мероприятие
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      authorId: parseInt(session.user.id),
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <EventEditor
        event={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          format: event.format,
          type: event.type,
          city: event.city,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          coverImage: event.coverImage,
          status: event.status,
          rejectionReason: event.rejectionReason,
        }}
      />
    </div>
  );
}
