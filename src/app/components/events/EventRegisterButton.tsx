"use client";

import { useState } from "react";
import { App, Button } from "antd";
import { useRouter } from "next/navigation";
import {
  registerForEvent,
  unregisterFromEvent,
} from "@/app/in/events/my/actions/registerEvent";
import { FeedItem } from "@/app/in/lenta/types";
import { formatDate } from "../ui/date";

interface RegisterButtonProps {
  event: FeedItem;
  isRegistered: boolean;
  isLoggedIn: boolean;
  isAuthor: boolean;
  isEnded: boolean;
}

export function RegisterButton({
  event,
  isRegistered,
  isLoggedIn,
  isAuthor,
  isEnded,
}: RegisterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  const { message } = App.useApp();

  const { startRegDate, endRegDate } = event;
  const isRegStart = startRegDate ? new Date(startRegDate) < new Date() : null;
  const isRegEnd = endRegDate ? new Date(endRegDate) < new Date() : null;

  const handleRegister = async () => {
    if (!isLoggedIn) {
      message.info("Для регистрации необходимо войти в систему");
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const result = await registerForEvent(event.id);

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
      const result = await unregisterFromEvent(event.id);

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

  if (isRegEnd) {
    return (
      <Button type="default" disabled>
        Регистрация завершена {formatDate(endRegDate || "")}
      </Button>
    );
  }

  if (!isRegStart) {
    return (
      <Button type="default" disabled>
        Регистрация c {formatDate(startRegDate || "")}
      </Button>
    );
  }

  return (
    <Button type="primary" onClick={handleRegister} loading={loading}>
      Зарегистрироваться до {formatDate(endRegDate || "")}
    </Button>
  );
}
