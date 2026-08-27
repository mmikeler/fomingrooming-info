import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Avatar, Empty, Tooltip } from "antd";
import { ContactButton } from "./components/ContactButton";
import { ShortCard } from "./components/shortcard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Button from "@/app/components/ui/button";
import { Calendar, MapPin, Settings, User } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Генерация мета-тегов для страницы профиля
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      name: true,
      city: true,
      avatar: true,
    },
  });

  if (!user) {
    return {
      title: "Пользователь не найден",
    };
  }

  const description = user.city
    ? `${user.name} - ${user.city}. Профиль на fomingroominginfo.ru`
    : `${user.name} - Профиль на fomingroominginfo.ru`;

  return {
    title: `${user.name} - Профиль`,
    description,
    openGraph: {
      title: user.name,
      description,
      images: user.avatar ? [{ url: user.avatar }] : [],
    },
  };
}

/**
 * Публичная страница профиля пользователя
 */
export default async function UserProfilePage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const isOwner = session?.user?.slug === slug;

  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      city: true,
      phone: true,
      avatar: true,
      slug: true,
      description: true,
      createdAt: true,
      showContacts: true,
      _count: {
        select: {
          posts: true,
          events: true,
        },
      },
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { created: "desc" },
        take: 3,
      },
      events: {
        where: { status: "PUBLISHED" },
        orderBy: { created: "desc" },
        take: 3,
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto min-h-[calc(100dvh-130px)] p-6">
      <div className="mx-auto max-w-4xl">
        {/* Заголовок профиля */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Аватар */}
            <div className="relative max-w-50 shrink-0">
              {user.avatar ? (
                <Avatar
                  size={200}
                  src={user.avatar}
                  className="border-2 border-gray-200"
                />
              ) : (
                <Avatar size={200} icon={<User />} className="bg-gray-300" />
              )}
              <div className="absolute -bottom-1 left-0 w-100">
                <span className="rounded-full bg-sky-600 px-3 py-1 text-sm text-sky-100">
                  @{user.slug}
                </span>
              </div>
            </div>

            {/* Информация о пользователе */}
            <div className="relative flex-1 text-center sm:text-left">
              <h1 className="mb-0 text-3xl font-bold">{user.name}</h1>

              {/* Описание */}
              <div className="mt-0 flex items-end gap-4">
                <span>{user.description && user.description}</span>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-gray-600">
                {user.city && (
                  <span className="flex items-center gap-1">
                    <MapPin />
                    {user.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar />
                  На сайте с{" "}
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>

              {/* Блок контактов */}
              <ContactButton
                slug={user.slug}
                showContacts={user.showContacts}
              />

              {/* Ссылка на настройки профиля */}
              {isOwner && (
                <Link href={`/in/u/${slug}/settings`}>
                  <Tooltip title="Настроить профиль">
                    <Button
                      title="Настроить профиль"
                      className="ms-auto mt-1 flex items-center gap-2 p-3!"
                    >
                      <Settings size={20} color="white" />
                    </Button>
                  </Tooltip>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Публикации пользователя */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">
            Публикации ({user._count.posts})
          </h2>

          {user.posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {user.posts.map((post) => (
                <ShortCard key={post.id} record={post} />
              ))}
            </div>
          ) : (
            <Empty
              description="Пока нет публикаций"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>

        {/* Мероприятия пользователя */}
        <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">
            Мероприятия ({user._count.events})
          </h2>

          {user.events.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {user.events.map((event) => (
                <ShortCard key={event.id} record={event} />
              ))}
            </div>
          ) : (
            <Empty
              description="Пока нет мероприятий"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </div>
  );
}
