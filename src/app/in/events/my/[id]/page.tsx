import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EventEditor } from "./components/EventEditor";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import BackButton from "@/app/in/components/backButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventEditPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = session.user;

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
    include: {
      _count: {
        select: {
          registrations: true,
          favorites: true,
          likes: true,
          views: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <BackButton label="К списку мероприятий" url="/in/events/my" />
      </div>
      <EventEditor event={event} userRole={user.role} />
    </div>
  );
}
