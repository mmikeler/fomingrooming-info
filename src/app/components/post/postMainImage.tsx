import { FeedItem } from "@/app/in/lenta/actions/getFeedItems";
import {
  extractFirstImageFromContent,
  getFullImageUrl,
} from "@/app/in/lenta/utils/extractFirstImage";
import { PawPrint } from "lucide-react";
import Image from "next/image";

export default function PostMainImage({ post }: { post: FeedItem }) {
  // Получаем изображение из контента/description, если нет обложки
  const contentSource = post.content || post.description;
  const fallbackImage =
    !post.coverImage && contentSource
      ? getFullImageUrl(extractFirstImageFromContent(contentSource))
      : null;
  const displayImage = post.coverImage || fallbackImage;

  return (
    <div className="relative h-70 w-full overflow-hidden">
      {displayImage ? (
        <Image
          src={displayImage}
          alt={post.title}
          fill
          className="object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-linear-to-br from-blue-400 to-purple-500`}
        >
          <span className="text-6xl">
            <PawPrint />
          </span>
        </div>
      )}
    </div>
  );
}
