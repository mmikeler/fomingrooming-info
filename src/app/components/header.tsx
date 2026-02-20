"use client";

import { Dropdown, Avatar, message, Space, Flex, Button as B } from "antd";
import { Header as AntHeader } from "antd/es/layout/layout";
import { User, LogOut, Shield, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationBell } from "./notification-bell";
import Image from "next/image";
import Button from "./ui/button";
import Navigation from "./ui/navigation";

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      message.success("Вы успешно вышли из системы");
    } catch {
      message.error("Ошибка при выходе");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: "Профиль",
      onClick: () => router.push("/profile"),
    },
    {
      key: "moderation",
      icon: <Shield size={16} />,
      label: "Модерация",
      onClick: () => router.push("/moderation"),
    },
    {
      key: "admin",
      icon: <Settings size={16} />,
      label: "Админ-панель",
      onClick: () => router.push("/admin"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Выйти",
      onClick: handleSignOut,
    },
  ];

  return (
    <AntHeader
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <div className="p-5">
        <Flex justify="space-between">
          <Space size="large">
            <Link
              className="text-[10px] text-(--foreground)! uppercase"
              href="/"
            >
              О проекте
            </Link>
            <Link
              className="text-[10px] text-(--foreground)! uppercase"
              href="/"
            >
              Реклама на сайте
            </Link>
            <Link
              className="text-[10px] text-(--foreground)! uppercase"
              href="/"
            >
              Техподдержка
            </Link>
          </Space>
          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />
            ) : session?.user ? (
              <>
                <NotificationBell />
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <B
                    type="text"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
                  >
                    <span
                      className="hidden sm:inline"
                      style={{ color: "var(--foreground)" }}
                    >
                      {session.user.name || "Пользователь"}
                    </span>
                    <Avatar
                      size="small"
                      src={session.user.image}
                      style={{
                        backgroundColor: "var(--foreground)",
                        color: "var(--background)",
                      }}
                    >
                      {session.user.name?.charAt(0) ||
                        session.user.email?.charAt(0)}
                    </Avatar>
                  </B>
                </Dropdown>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="primary"
                  onClick={() => router.push("/auth/signin")}
                >
                  Войти
                </Button>
                <Button
                  type="primary"
                  onClick={() => router.push("/auth/signup")}
                >
                  Регистрация
                </Button>
              </div>
            )}
          </div>
        </Flex>
      </div>
      <div className="flex items-center justify-between rounded-[25px] bg-(--foreground) p-2 lg:p-6">
        <Link href="/" className="relative flex h-13 w-33 items-center">
          <Image
            fill
            style={{ objectFit: "contain" }}
            src={"/logo.png"}
            alt="Фомин Груминг Инфо"
          />
        </Link>
        <div className="ms-auto"></div>
        <Navigation />
      </div>
    </AntHeader>
  );
}
