"use client";

import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = Required<MenuProps>["items"][number];

// Карта соответствия ключей меню путям
const menuKeyToPath: Record<string, string> = {
  profile: "/profile",
  posts: "/profile/posts",
  // Добавляйте новые пункты здесь
};

export default function ProfileSidebar() {
  const pathname = usePathname();

  // Определяем активный пункт меню на основе текущего пути
  const getSelectedKey = (): string | undefined => {
    // Сортируем пути по длине (от самого длинного к короткому)
    const sortedEntries = Object.entries(menuKeyToPath).sort(
      (a, b) => b[1].length - a[1].length,
    );

    for (const [key, path] of sortedEntries) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return key;
      }
    }
    return undefined;
  };

  const selectedKey = getSelectedKey();

  const items: MenuItem[] = [
    {
      label: <Link href={"/profile"}>Профиль</Link>,
      key: "profile",
      icon: <UserOutlined />,
    },
    {
      label: <Link href={"/profile/posts"}>Посты</Link>,
      key: "posts",
      icon: <EditOutlined />,
    },
  ];

  return (
    <Sider theme="light">
      <Menu selectedKeys={selectedKey ? [selectedKey] : []} items={items} />
    </Sider>
  );
}
