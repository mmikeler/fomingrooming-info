"use client";

import { useState, useEffect } from "react";
import { Badge, Dropdown, Button, List, Empty, Spin } from "antd";
import { Bell, Check, CheckCheck } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/notifications";

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: Date;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const [notifs, count] = await Promise.all([
      getNotifications(),
      getUnreadCount(),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      if (mounted) {
        setNotifications(notifs);
        setUnreadCount(count);
        setLoading(false);
      }
    };

    load();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Только что";
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return d.toLocaleDateString("ru-RU");
  };

  const dropdownContent = (
    <div className="max-h-96 w-80 overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="flex items-center justify-between border-b p-3">
        <span className="font-semibold">Уведомления</span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <CheckCheck size={14} className="mr-1" />
            Прочитать все
          </Button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description="Нет уведомлений"
            className="py-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer px-3 py-2 hover:bg-gray-50 ${
                  !item.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-sm font-medium ${
                        !item.isRead ? "text-blue-700" : ""
                      }`}
                    >
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <Button
                        type="link"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                        }}
                        className="ml-2 p-0"
                      >
                        <Check size={14} />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                    {item.message}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Button type="text" className="relative p-2">
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Bell size={20} className="lg:text-(--foreground)" />
        </Badge>
      </Button>
    </Dropdown>
  );
}
