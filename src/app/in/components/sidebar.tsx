"use client";

import { Copyright } from "@/app/components/copyright";
import { Divider, Flex, Menu, MenuProps, Space } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  Bookmark,
  CalendarCheck2,
  CalendarPlus,
  Calendars,
  CalendarSearch,
  FilePenLine,
  FilePlusCorner,
  FileSearchCorner,
  Home,
  Images,
  Newspaper,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuItem = Required<MenuProps>["items"][number];

// Карта соответствия ключей меню путям
const menuKeyToPath: Record<string, string> = {
  lenta: "/in/lenta",
  profile: "/in/profile",
  posts_search: "/in/posts",
  posts_my: "/in/posts/my",
  events_search: "/in/events",
  events_my: "/in/events/my",
  events_registered: "/in/events/registered",
  favorites: "/in/favorites",
  files: "/in/files",
  // Добавляйте новые пункты здесь
};

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const [collapsed, setCollapsed] = useState(false);

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
  const iconSize = 18;

  // Ключи недоступные без авторизации
  const protectedKeys = [
    "profile",
    "posts_my",
    "events_my",
    "events_registered",
    "favorites",
    "files",
  ];

  // Функция для проверки, является ли ключ защищённым
  const isProtected = (key?: string | number | bigint): boolean => {
    return (
      key !== undefined &&
      typeof key === "string" &&
      protectedKeys.includes(key)
    );
  };

  // Функция для фильтрации защищённых элементов
  const filterProtectedItems = (items: MenuItem[]): MenuItem[] => {
    return (
      items
        .filter((item) => {
          if (!item || typeof item === "string") return true;
          // Фильтруем сам элемент
          if (isProtected(item.key)) return false;
          // Фильтруем вложенные элементы
          const menuItem = item as {
            key?: string | number;
            children?: MenuItem[];
          };
          if (menuItem.children) {
            menuItem.children = menuItem.children.filter(
              (child) =>
                !(
                  typeof child !== "string" &&
                  child !== null &&
                  isProtected(child.key)
                ),
            ) as typeof menuItem.children;
          }
          return true;
        })
        // Удаляем пустые children после фильтрации
        .map((item) => {
          if (!item || typeof item === "string") return item;
          const menuItem = item as {
            key?: string | number;
            children?: MenuItem[];
          };
          if (menuItem.children && menuItem.children.length === 0) {
            return { ...item, children: undefined } as typeof item;
          }
          return item;
        })
    );
  };

  // Базовые пункты меню
  const baseItems: MenuItem[] = [
    {
      label: <Link href="/feed">Главная</Link>,
      key: "feed",
      icon: <Home size={iconSize} />,
    },
    {
      label: <Link href="/in/lenta">Лента</Link>,
      key: "lenta",
      icon: <Newspaper size={iconSize} />,
    },
    {
      label: <Link href="/in/profile">Профиль</Link>,
      key: "profile",
      icon: <UserRound size={iconSize} />,
    },
    {
      label: "Посты",
      key: "posts",
      icon: <FilePenLine size={iconSize} />,
      children: [
        {
          label: <Link href="/in/posts">Поиск</Link>,
          key: "posts_search",
          icon: <FileSearchCorner size={iconSize} />,
        },
        {
          label: <Link href="/in/posts/my">Мои посты</Link>,
          key: "posts_my",
          icon: <FilePlusCorner size={iconSize} />,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      label: "Мероприятия",
      key: "events",
      icon: <Calendars size={iconSize} />,
      children: [
        {
          label: <Link href="/in/events">Поиск</Link>,
          key: "events_search",
          icon: <CalendarSearch size={iconSize} />,
        },
        {
          label: <Link href="/in/events/my">Организую</Link>,
          key: "events_my",
          icon: <CalendarPlus size={iconSize} />,
        },
        {
          label: <Link href="/in/events/registered">Участвую</Link>,
          key: "events_registered",
          icon: <CalendarCheck2 size={iconSize} />,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      label: <Link href="/in/favorites">Закладки</Link>,
      key: "favorites",
      icon: <Bookmark size={iconSize} />,
    },
    {
      label: <Link href="/in/files">Файлы</Link>,
      key: "files",
      icon: <Images size={iconSize} />,
    },
  ];

  // Фильтруем только для неавторизованных пользователей
  const items: MenuItem[] = isAuthenticated
    ? baseItems
    : filterProtectedItems(baseItems);

  const siderStyle: React.CSSProperties = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
  };

  return (
    <Sider
      style={siderStyle}
      theme="light"
      collapsible={true}
      collapsedWidth={60}
      onCollapse={(collapsed) => setCollapsed(collapsed)}
    >
      <Menu
        defaultOpenKeys={["events", "posts"]}
        selectedKeys={selectedKey ? [selectedKey] : []}
        items={items}
        mode="inline"
      />
      {!collapsed && (
        <>
          <Divider />
          <Flex gap="small" wrap>
            <Link className="text-xs text-(--foreground)!" href="/">
              О проекте
            </Link>
            <Link className="text-xs text-(--foreground)!" href="/">
              Реклама на сайте
            </Link>
            <Link className="text-xs text-(--foreground)!" href="/">
              Техподдержка
            </Link>
          </Flex>
          <Divider />

          <Space vertical className="text-[10px] text-gray-400!">
            <Copyright />
          </Space>
        </>
      )}
    </Sider>
  );
}
