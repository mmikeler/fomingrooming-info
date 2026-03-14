"use client";

import { useState } from "react";
import { Button, message } from "antd";
import { useRouter } from "next/navigation";
import {
  registerForEvent,
  unregisterFromEvent,
} from "@/app/profile/events/my/actions/registerEvent";

interface RegisterButtonProps {
  eventId: number;
  isRegistered: boolean;
  isLoggedIn: boolean;
  isAuthor: boolean;
  isEnded: boolean;
}

export function RegisterButton({
  eventId,
  isRegistered,
  isLoggedIn,
  isAuthor,
  isEnded,
}: RegisterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);

  const handleRegister = async () => {
    if (!isLoggedIn) {
      message.info("Для регистрации необходимо войти в систему");
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const result = await registerForEvent(eventId);

      if (result.success) {
        setRegistered(true);
        message.success("Вы успешно зарегистрированы на мероприятие!");
        router.refresh();
      } else {
        message.error(result.error?.message || "Ошибка при регистрации");
      }
    } catch {
      message.error("Ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    setLoading(true);
    try {
      const result = await unregisterFromEvent(eventId);

      if (result.success) {
        setRegistered(false);
        message.success("Вы отменили регистрацию на мероприятие");
        router.refresh();
      } else {
        message.error(result.error?.message || "Ошибка при отмене регистрации");
      }
    } catch {
      message.error("Ошибка при отмене регистрации");
    } finally {
      setLoading(false);
    }
  };

  if (isEnded) {
    return (
      <Button type="default" disabled>
        Мероприятие завершено
      </Button>
    );
  }

  if (isAuthor) {
    return (
      <Button type="default" disabled>
        Вы организатор
      </Button>
    );
  }

  if (registered) {
    return (
      <Button
        type="default"
        onClick={handleUnregister}
        loading={loading}
        danger
      >
        Отменить регистрацию
      </Button>
    );
  }

  return (
    <Button type="primary" onClick={handleRegister} loading={loading}>
      Зарегистрироваться
    </Button>
  );
}
