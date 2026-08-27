"use client";

import { Divider, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  ChartArea,
  ChartSpline,
  FilePenLine,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { child } from "winston";

export default function Sidebar() {
  const iconSize = 20;

  const menuItems = [
    {
      key: "dashboard",
      label: (
        <Link href="/admin">
          <span>Сводка</span>
        </Link>
      ),
      icon: <ChartSpline size={iconSize} />,
    },
    {
      key: "1",
      label: (
        <Link href="/admin/users">
          <span>Пользователи</span>
        </Link>
      ),
      icon: <Users size={iconSize} />,
    },
    {
      key: "2",
      label: (
        <Link href="/admin/moderation">
          <span>Модерация</span>
        </Link>
      ),
      icon: <FilePenLine size={iconSize} />,
    },
    {
      key: "3",
      label: "Реклама",
      icon: <Megaphone size={iconSize} />,
      children: [
        {
          key: "reklama_dashboard",
          label: (
            <Link href="/admin/reklama/dashboard">
              <span>Сводка</span>
            </Link>
          ),
          icon: <ChartArea size={iconSize} />,
        },
        {
          key: "reklama_settings",
          label: (
            <Link href="/admin/reklama/settings">
              <span>Настройка</span>
            </Link>
          ),
          icon: <Settings size={iconSize} />,
        },
      ],
    },
  ];

  return (
    <Sider style={{ minHeight: "100dvh", fontSize: "16px" }}>
      <div className="pt-4 text-center text-lg font-bold text-white">
        Директорская
      </div>
      <Divider style={{ backgroundColor: "white" }} />
      <Menu theme="dark" items={menuItems} mode="inline" />
    </Sider>
  );
}
