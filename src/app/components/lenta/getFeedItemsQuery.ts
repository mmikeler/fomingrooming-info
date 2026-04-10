// НЕ ГОТОВО

import { getFeedItem } from "@/app/in/lenta/actions/getFeedItem";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

type POST_TYPE = "POST" | "EVENT" | "ALL";
type QUERY = {
  id?: number;
  slug?: string;
  status?: "DRAFT" | "PUBLISHED" | "REJECTED";
  userId?: number;
};

export default async function getPostQuery(
  postType: POST_TYPE,
  query: QUERY,
  isAuthor?: boolean,
) {
  let posts: { slug: string }[] = [];
  let events: { slug: string }[] = [];

  if (isAuthor) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, errorMessage: "Необходима авторизация" };
    }

    query = {
      ...query,
      userId: parseInt(session.user.id),
    };
  }

  if (postType === "POST" || postType === "ALL") {
    posts = await prisma.post.findMany({
      where: {
        ...query,
        status: "PUBLISHED",
      },
      select: {
        slug: true,
      },
    });
  }

  if (postType === "EVENT" || postType === "ALL") {
    events = await prisma.event.findMany({
      where: {
        ...query,
        status: "PUBLISHED",
      },
      select: {
        slug: true,
      },
    });
  }

  const postsFeed = await Promise.all(
    posts.map((post) => getFeedItem({ idOrSlug: post.slug, type: "POST" })),
  );
  const eventsFeed = await Promise.all(
    events.map((event) => getFeedItem({ idOrSlug: event.slug, type: "EVENT" })),
  );

  return { success: true, data: [...postsFeed, ...eventsFeed] };
}
