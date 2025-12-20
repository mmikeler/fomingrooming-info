"use client";

import { Button, Dropdown, Avatar, message } from "antd";
import { Header as AntHeader } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      <div className="container mx-auto flex h-full items-center justify-between px-6 py-2">
        <Link href="/" className="flex items-center">
          <Title level={3} style={{ color: "var(--foreground)", margin: 0 }}>
            ФГ-Инфо
          </Title>
        </Link>

        <div className="flex items-center">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />
          ) : session?.user ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button
                type="text"
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
              >
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
                <span
                  className="hidden sm:inline"
                  style={{ color: "var(--foreground)" }}
                >
                  {session.user.name || "Пользователь"}
                </span>
              </Button>
            </Dropdown>
          ) : (
            <div className="flex gap-2">
              <Button
                color="default"
                variant="outlined"
                style={{ backgroundColor: "transparent" }}
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
      </div>
    </AntHeader>
  );
}
