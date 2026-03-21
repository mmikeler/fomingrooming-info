"use client";

import { useState } from "react";
import { Button, Spin } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/favorites/actions/favorites";
import type { FavoriteItemType } from "@/app/favorites/actions/favorites";
import { PawPrint } from "lucide-react";

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

  if (isFavoriteState) {
    return (
      <Button
        type="link"
        onClick={handleToggle}
        loading={loading}
        icon={<PawPrint fill="red" color="red" />}
      ></Button>
    );
  }

  return (
    <Button
      type="link"
      onClick={handleToggle}
      loading={loading}
      icon={<PawPrint color="gray" />}
    ></Button>
  );
}
