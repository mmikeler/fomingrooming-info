import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users2 } from "lucide-react";
import { Card, Space } from "antd";
import { RegisteredUsersWidget } from "./components/users";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventStatPage({ params }: PageProps) {
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

  if (parseInt(user.id) !== event.authorId) {
    return "У вас нет доступа к этой информации";
  }

  return (
    <div className="container mx-auto p-4">
      <Link
        href={`/in/events/my/${event.id}`}
        className="flex w-fit items-center gap-2"
      >
        <ArrowLeft size={20} /> Назад к редактированию
      </Link>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Card
          size="small"
          title={
            <Space>
              <Users2 size={15} /> <span className="">Участники</span>
            </Space>
          }
        >
          <RegisteredUsersWidget eventId={eventId} />
        </Card>
      </div>
    </div>
  );
}
