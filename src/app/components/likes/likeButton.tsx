"use client";

import { useState } from "react";
import { Button, Spin, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/app/components/likes/actions/likes";
import type { LikeItemType } from "@/app/components/likes/actions/likes";
import { Heart } from "lucide-react";
import type { FeedItem } from "@/app/in/lenta/actions/getFeedItem";

interface LikeButtonProps {
  /** Пост или мероприятие */
  post: FeedItem;
}

/**
 * Компонент кнопки лайка для постов и мероприятий
 * @param post - Пост или мероприятие (FeedItem)
 * @return Кнопка с иконкой и счетчиком лайков
 */
export default function LikeButton({ post }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLikedState, setIsLikedState] = useState(post.isLiked);
  const [likesCountState, setLikesCountState] = useState(post.likesCount);

  const isLoggedIn = !!session?.user?.id;
  const itemType: LikeItemType = post.type === "EVENT" ? "EVENT" : "POST";

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const result = await toggleLike(post.id, itemType);

      if (result.success && result.data) {
        setIsLikedState(result.data.isLiked);
        setLikesCountState(result.data.likesCount);
      }
    } catch {
      // Ошибка обрабатывается внутри action
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <Tooltip title={isLikedState ? "Убрать лайк" : "Поставить лайк"}>
      <Button
        type="link"
        onClick={handleToggle}
        loading={loading}
        className="flex items-center gap-1"
        icon={
          isLikedState ? (
            <Heart fill="red" color="red" size={18} />
          ) : (
            <Heart size={18} className="text-(--foreground)!" />
          )
        }
      >
        {likesCountState > 0 ? likesCountState : ""}
      </Button>
    </Tooltip>
  );
}
