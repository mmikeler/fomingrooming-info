"user client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "../notification-bell";
import { Dropdown, Avatar, Flex, Button as B, MenuProps, App } from "antd";
import { User, LogOut, Shield, Settings } from "lucide-react";
import Button from "./button";

export default function UserAuthWidget() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { message } = App.useApp();

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      message.success("Вы успешно вышли из системы");
    } catch {
      message.error("Ошибка при выходе");
    }
  };

  // Build menu items based on user role
  const buildMenuItems = (): MenuProps["items"] => {
    const role = session?.user?.role || "USER";
    const items: MenuProps["items"] = [
      {
        key: "profile",
        icon: <User size={16} />,
        label: "Профиль",
        onClick: () => router.push("/profile"),
      },
    ];

    // Add moderation link for MODERATOR, ADMIN, SUPERADMIN
    if (role === "MODERATOR" || role === "ADMIN" || role === "SUPERADMIN") {
      items.push({
        key: "moderation",
        icon: <Shield size={16} />,
        label: "Модерация",
        onClick: () => router.push("/moderation"),
      });
    }

    // Add admin link for ADMIN and SUPERADMIN
    if (role === "ADMIN" || role === "SUPERADMIN") {
      items.push({
        key: "admin",
        icon: <Settings size={16} />,
        label: "Админ-панель",
        onClick: () => router.push("/admin"),
      });
    }

    // Add divider and logout
    items.push({ type: "divider" as const });
    items.push({
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Выйти",
      onClick: handleSignOut,
    });

    return items;
  };

  if (status === "loading")
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />
      </div>
    );

  return (
    <>
      {session?.user ? (
        <Flex gap={4}>
          <NotificationBell />
          <Dropdown
            menu={{ items: buildMenuItems() }}
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
                size="large"
                src={session.user.image}
                style={{
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  border: "2px solid #ffffff",
                }}
              >
                {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
              </Avatar>
            </B>
          </Dropdown>
        </Flex>
      ) : (
        <div className="flex flex-col gap-2 lg:flex-row">
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            style={{ fontSize: "10px" }}
            type="button"
            onClick={() => router.push("/auth/signin")}
          >
            Войти
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            style={{ fontSize: "10px" }}
            type="button"
            onClick={() => router.push("/auth/signup")}
          >
            Регистрация
          </Button>
        </div>
      )}
    </>
  );
}
