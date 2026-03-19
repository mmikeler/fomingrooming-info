"use client";

import { useState } from "react";
import { Button } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleFavorite, isFavorite } from "@/app/favorites/actions/favorites";

interface FavoriteButtonProps {
  eventId: number;
  initialIsFavorite?: boolean;
}

export function FavoriteButton({
  eventId,
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
      const result = await toggleFavorite(eventId);

      if (result.success) {
        setIsFavoriteState(result.data?.isFavorite ?? false);
      }
    } catch {
      // Ошибка обрабатывается внутри action
    } finally {
      setLoading(false);
    }
  };

  if (isFavoriteState) {
    return (
      <Button
        type="default"
        onClick={handleToggle}
        loading={loading}
        icon={<HeartFilled style={{ color: "#ff4d4f" }} />}
      >
        В избранном
      </Button>
    );
  }

  return (
    <Button
      type="default"
      onClick={handleToggle}
      loading={loading}
      icon={<HeartOutlined />}
    >
      В избранное
    </Button>
  );
}
