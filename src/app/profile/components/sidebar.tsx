"use client";

import { Divider, Flex, Menu, MenuProps, Space } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  CalendarCheck2,
  CalendarPlus,
  Calendars,
  CalendarSearch,
  FilePenLine,
  Heart,
  Home,
  Newspaper,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuItem = Required<MenuProps>["items"][number];

// Карта соответствия ключей меню путям
const menuKeyToPath: Record<string, string> = {
  profile: "/profile",
  posts: "/profile/posts",
  events: "/profile/events",
  events_my: "/profile/events/my",
  events_registered: "/profile/events/registered",
  favorites: "/profile/favorites",
  // Добавляйте новые пункты здесь
};

export default function ProfileSidebar() {
  const pathname = usePathname();
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

  const items: MenuItem[] = [
    {
      label: <Link href="/feed">Главная</Link>,
      key: "feed",
      icon: <Home size={iconSize} />,
    },
    {
      label: <Link href="/profile/lenta">Лента</Link>,
      key: "lenta",
      icon: <Newspaper size={iconSize} />,
    },
    {
      label: <Link href="/profile">Профиль</Link>,
      key: "profile",
      icon: <UserRound size={iconSize} />,
    },
    {
      label: <Link href="/profile/posts">Посты</Link>,
      key: "posts",
      icon: <FilePenLine size={iconSize} />,
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
          label: (
            <Link target="_blank" href="/feed/events">
              Поиск
            </Link>
          ),
          key: "events_search",
          icon: <CalendarSearch size={iconSize} />,
        },
        {
          label: <Link href="/profile/events/my">Организую</Link>,
          key: "events_my",
          icon: <CalendarPlus size={iconSize} />,
        },
        {
          label: <Link href="/profile/events/registered">Участвую</Link>,
          key: "events_registered",
          icon: <CalendarCheck2 size={iconSize} />,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      label: <Link href="/profile/favorites">Избранное</Link>,
      key: "favorites",
      icon: <Heart size={iconSize} />,
    },
  ];

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
        defaultOpenKeys={["events"]}
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
            <div className="">© ИП Иванов ИИ 2026</div>
            <Link className="text-gray-400!" href="mailto:sobaka@sobaka.ru">
              sobaka@sobaka.ru
            </Link>
            <Link className="text-gray-400!" href="tel:+7 999 999 99 99">
              +7 999 999 99 99
            </Link>
            <div className="">г.Москва</div>
            <div className="">Версия: 0.16.0</div>
          </Space>
        </>
      )}
    </Sider>
  );
}
