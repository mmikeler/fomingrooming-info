import { FeedItem } from "@/app/in/lenta/actions/getFeedItems";
import Image from "next/image";
import Link from "next/link";

export default function PostAuthorAvatar({
  userData,
}: {
  userData: FeedItem["author"];
}) {
  const { slug, avatar, name } = userData;

  return (
    <Link
      target="_blank"
      href={`/u/${slug}`}
      onClick={(e) => e.stopPropagation()}
      className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
    >
      {avatar ? (
        <div className="relative h-8 w-8 overflow-hidden rounded-full">
          <Image src={avatar} alt={name} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
          <span className="text-xs font-semibold text-gray-600">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span className="hover:underline">{name}</span>
    </Link>
  );
}
