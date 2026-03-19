import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EventStatus } from "@/generated/prisma/enums";
import { FavoriteType } from "@/generated/prisma/enums";
import { RegisterButton } from "./components/RegisterButton";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { EventTypeTag } from "@/app/components/events/EventTypeTag";
import { FavoriteButton } from "@/app/components/FavoriteButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // Получаем мероприятие по slug
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      format: true,
      type: true,
      city: true,
      location: true,
      startDate: true,
      endDate: true,
      coverImage: true,
      status: true,
      authorId: true,
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Проверяем статус - только опубликованные мероприятия видны всем
  if (event.status !== EventStatus.PUBLISHED) {
    // Если автор или модератор - показываем
    const isAuthor =
      session?.user?.id && parseInt(session.user.id) === event.authorId;

    // Проверяем, является ли пользователь модератором
    let isModerator = false;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(session.user.id) },
        select: { role: true },
      });
      if (user) {
        const { canModerate } = await import("@/lib/permissions");
        isModerator = canModerate(user.role);
      }
    }

    if (!isAuthor && !isModerator) {
      notFound();
    }
  }

  // Проверяем, зарегистрирован ли пользователь
  let isRegistered = false;
  let isFavorite = false;
  if (session?.user?.id) {
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: parseInt(session.user.id),
        },
      },
    });
    isRegistered = !!registration;

    // Проверяем, в избранном ли мероприятие
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: parseInt(session.user.id),
        type: FavoriteType.EVENT,
        eventId: event.id,
      },
    });
    isFavorite = !!favorite;
  }

  const formatLabel = event.format === "ONLINE" ? "Онлайн" : "Оффлайн";

  const isEnded = new Date() > event.endDate;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Обложка */}
        {event.coverImage && (
          <div className="relative mb-6 h-75 w-full overflow-hidden rounded-lg">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Заголовок */}
        <h1 className="mb-4 text-4xl font-bold">{event.title}</h1>

        {/* Тег типа мероприятия */}
        {event.type && (
          <div className="mb-4">
            <EventTypeTag type={event.type} />
          </div>
        )}

        {/* Информация о мероприятии */}
        <div className="mb-6 flex flex-wrap gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold">📍</span>
            <span>
              {formatLabel}
              {event.city && ` • ${event.city}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">📌</span>
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold">📅</span>
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>

          <CountdownTimer targetDate={event.startDate} />

          <div className="flex items-center gap-2">
            <span className="font-semibold">👥</span>
            <span>{event._count.registrations} зарегистрировано</span>
          </div>
        </div>

        {/* Кнопки регистрации и избранного */}
        <div className="mb-6 flex gap-3">
          <RegisterButton
            eventId={event.id}
            isRegistered={isRegistered}
            isLoggedIn={!!session?.user?.id}
            isAuthor={Boolean(
              session?.user?.id && parseInt(session.user.id) === event.authorId,
            )}
            isEnded={isEnded}
          />
          <FavoriteButton eventId={event.id} initialIsFavorite={isFavorite} />
        </div>

        {/* Описание */}
        {event.description && (
          <div className="prose mb-8 max-w-none">
            <h2 className="mb-4 text-2xl font-semibold">Описание</h2>
            <div className="whitespace-pre-wrap">{event.description}</div>
          </div>
        )}

        {/* Информация об авторе */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 text-lg font-semibold">Организатор</h3>
          <Link
            href={`/u/${event.author.slug}`}
            className="flex items-center gap-3"
          >
            {event.author.avatar ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={event.author.avatar}
                  alt={event.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                <span className="text-lg font-semibold text-gray-600">
                  {event.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-medium hover:underline">
              {event.author.name}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
