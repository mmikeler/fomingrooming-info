import { FeedItem } from "@/app/in/lenta/actions/getFeed";
import Image from "next/image";
import Link from "next/link";

export default function PostAuthorAvatar({
  userData,
}: {
  userData: FeedItem["author"];
}) {
  const { slug, avatar, name, description } = userData;

  return (
    <Link
      target="_blank"
      href={`/in/u/${slug}`}
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
      <div>
        <span className="block hover:underline">{name}</span>
        <span className="-mt-0.5 block text-xs font-light text-stone-400">
          {description}
        </span>
      </div>
    </Link>
  );
}
