"use client";

import { ContainerOutlined, DashboardOutlined } from "@ant-design/icons";
import { Menu, MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfileMenu() {
  const pathname = usePathname();

  type MenuItem = Required<MenuProps>["items"][number];

  const menuItemStyle = "";

  const items: MenuItem[] = [
    {
      key: "/profile",
      icon: <DashboardOutlined />,
      label: (
        <Link className={menuItemStyle} href="/profile">
          Профиль
        </Link>
      ),
    },
    {
      key: "/profile/posts",
      icon: <ContainerOutlined />,
      label: (
        <Link className={menuItemStyle} href="/profile/posts">
          Посты
        </Link>
      ),
    },
  ];

  return (
    <Menu items={items} mode="inline" theme="light" selectedKeys={[pathname]} />
  );
}
