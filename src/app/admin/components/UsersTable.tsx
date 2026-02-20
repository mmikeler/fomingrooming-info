"use client";

import { useState } from "react";
import { Table, Select, Tag, message } from "antd";
import { updateUserRole } from "../actions/updateUserRole";
import { canAssignRole, ROLE_HIERARCHY } from "@/lib/permissions";
import { UserRole } from "@/generated/prisma/enums";

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  _count: {
    posts: number;
  };
}

interface UsersTableProps {
  users: User[];
  currentUserId: number;
  currentUserRole: UserRole;
}

const roleColors: Record<UserRole, string> = {
  USER: "default",
  AUTHOR: "blue",
  MODERATOR: "green",
  ADMIN: "orange",
  SUPERADMIN: "red",
};

const roleLabels: Record<UserRole, string> = {
  USER: "Пользователь",
  AUTHOR: "Автор",
  MODERATOR: "Модератор",
  ADMIN: "Администратор",
  SUPERADMIN: "Суперадмин",
};

export function UsersTable({
  users: initialUsers,
  currentUserId,
  currentUserRole,
}: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<number | null>(null);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    setLoading(userId);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
        message.success("Роль успешно обновлена");
      } else {
        message.error(result.error || "Ошибка при обновлении роли");
      }
    } catch {
      message.error("Ошибка при обновлении роли");
    } finally {
      setLoading(null);
    }
  };

  const getAssignableRoles = () => {
    const roles: UserRole[] = [
      "USER",
      "AUTHOR",
      "MODERATOR",
      "ADMIN",
      "SUPERADMIN",
    ];
    return roles.filter((role) => canAssignRole(currentUserRole, role));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole, record: User) => {
        // Нельзя менять роль самому себе и пользователям с равной или выше ролью
        const canChange =
          record.id !== currentUserId &&
          ROLE_HIERARCHY[record.role] < ROLE_HIERARCHY[currentUserRole];

        if (!canChange) {
          return <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>;
        }

        return (
          <Select
            value={role}
            onChange={(newRole) => handleRoleChange(record.id, newRole)}
            loading={loading === record.id}
            disabled={loading !== null && loading !== record.id}
            style={{ width: 150 }}
            options={getAssignableRoles().map((r) => ({
              value: r,
              label: (
                <Tag color={roleColors[r]} style={{ margin: 0 }}>
                  {roleLabels[r]}
                </Tag>
              ),
            }))}
          />
        );
      },
    },
    {
      title: "Постов",
      key: "posts",
      render: (_: unknown, record: User) => record._count.posts,
      width: 80,
    },
    {
      title: "Создан",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) =>
        new Date(date).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  return (
    <Table
      dataSource={users}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 20 }}
    />
  );
}
