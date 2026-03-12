import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Avatar, Empty } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import Image from "next/image";

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

  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { created: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          created: true,
          coverImage: true,
        },
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
            <div className="shrink-0">
              {user.avatar ? (
                <Avatar
                  size={120}
                  src={user.avatar}
                  className="border-2 border-gray-200"
                />
              ) : (
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  className="bg-gray-300"
                />
              )}
            </div>

            {/* Информация о пользователе */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="mb-2 text-3xl font-bold">{user.name}</h1>

              <div className="mb-4 flex flex-wrap justify-center gap-4 text-gray-600 sm:justify-start">
                {user.city && (
                  <span className="flex items-center gap-1">
                    <EnvironmentOutlined />
                    {user.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarOutlined />
                  На сайте с{" "}
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>

              {/* Ссылка на профиль */}
              <div className="mt-4">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  @{user.slug}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Публикации пользователя */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Публикации</h2>

          {user.posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {user.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
                >
                  {post.coverImage && (
                    <div className="aspect-video w-full overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-blue-600">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              description="Пока нет публикаций"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </div>
  );
}
