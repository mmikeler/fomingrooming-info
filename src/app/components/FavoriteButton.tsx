"use client";

import { useState } from "react";
import { Button, Spin, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import {
  FavoriteItemType,
  toggleFavorite,
} from "../in/favorites/actions/favorites";

interface FavoriteButtonProps {
  /** ID записи (мероприятия, поста и т.д.) */
  itemId: number;
  /** Тип записи: EVENT или POST */
  type: FavoriteItemType;
  /** Начальное состояние избранного */
  initialIsFavorite?: boolean;
}

export function FavoriteButton({
  itemId,
  type,
  initialIsFavorite = false,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFavoriteState, setIsFavoriteState] = useState(initialIsFavorite);

  const isLoggedIn = !!session?.user?.id;

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const result = await toggleFavorite(itemId, type);

      if (result.success) {
        setIsFavoriteState(result.data?.isFavorite ?? false);
      }
    } catch {
      // Ошибка обрабатывается внутри action
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <Tooltip
      title={isFavoriteState ? "Удалить из закладок" : "Добавить в закладки"}
    >
      <Button
        type="link"
        onClick={handleToggle}
        loading={loading}
        icon={
          isFavoriteState ? (
            <Bookmark fill="red" color="red" />
          ) : (
            <Bookmark color="gray" />
          )
        }
      ></Button>
    </Tooltip>
  );
}
