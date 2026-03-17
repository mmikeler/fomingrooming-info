"use client";

import { useState } from "react";
import {
  Table,
  Select,
  Tag,
  message,
  Button,
  Space,
  Popconfirm,
  Modal,
  Input,
} from "antd";
import { updateUserRole } from "../actions/updateUserRole";
import { restrictUser, banUser, unbanUser } from "../actions/manageUserStatus";
import { canAssignRole, ROLE_HIERARCHY } from "@/lib/permissions";
import { UserRole, AccountStatus } from "@/generated/prisma/enums";
import {
  WarningOutlined,
  LockOutlined,
  UnlockOutlined,
  StopOutlined,
} from "@ant-design/icons";

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  banReason: string | null;
  bannedAt: Date | null;
  restrictedReason: string | null;
  restrictedAt: Date | null;
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

const statusColors: Record<AccountStatus, string> = {
  ACTIVE: "green",
  RESTRICTED: "orange",
  BANNED: "red",
};

const statusLabels: Record<AccountStatus, string> = {
  ACTIVE: "Активен",
  RESTRICTED: "Ограничен",
  BANNED: "Заблокирован",
};

export function UsersTable({
  users: initialUsers,
  currentUserId,
  currentUserRole,
}: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<number | null>(null);
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState<"restrict" | "ban">("restrict");

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

  const canManageUser = (user: User): boolean => {
    // Нельзя управлять самим собой
    if (user.id === currentUserId) return false;
    // Нельзя управлять пользователями с равной или выше ролью
    if (ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[currentUserRole]) {
      return false;
    }
    // SUPERADMIN может управлять только ADMIN и ниже
    if (currentUserRole !== "SUPERADMIN" && user.role === "SUPERADMIN") {
      return false;
    }
    return true;
  };

  const openBanModal = (user: User, type: "restrict" | "ban") => {
    setSelectedUser(user);
    setBanType(type);
    setBanReason("");
    setBanModalVisible(true);
  };

  const handleBan = async () => {
    if (!selectedUser) return;

    if (banType === "restrict" && !banReason.trim()) {
      message.error("Укажите причину ограничения");
      return;
    }

    if (banType === "ban" && !banReason.trim()) {
      message.error("Укажите причину блокировки");
      return;
    }

    setLoading(selectedUser.id);
    try {
      let result;
      if (banType === "restrict") {
        result = await restrictUser(selectedUser.id, banReason);
      } else {
        result = await banUser(selectedUser.id, banReason);
      }

      if (result.success) {
        const newStatus = banType === "restrict" ? "RESTRICTED" : "BANNED";
        setUsers(
          users.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  status: newStatus,
                  restrictedAt:
                    banType === "restrict" ? new Date() : u.restrictedAt,
                  banReason: banType === "ban" ? banReason : null,
                  bannedAt: banType === "ban" ? new Date() : null,
                }
              : u,
          ),
        );
        message.success(
          banType === "restrict"
            ? "Пользователь ограничен"
            : "Пользователь заблокирован",
        );
        setBanModalVisible(false);
      } else {
        message.error(result.error || "Ошибка");
      }
    } catch {
      message.error("Ошибка при изменении статуса");
    } finally {
      setLoading(null);
      setSelectedUser(null);
    }
  };

  const handleUnban = async (userId: number) => {
    setLoading(userId);
    try {
      const result = await unbanUser(userId);
      if (result.success) {
        setUsers(
          users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status: "ACTIVE",
                  banReason: null,
                  bannedAt: null,
                  restrictedReason: null,
                  restrictedAt: null,
                }
              : u,
          ),
        );
        message.success("Ограничения сняты");
      } else {
        message.error(result.error || "Ошибка");
      }
    } catch {
      message.error("Ошибка при снятии ограничений");
    } finally {
      setLoading(null);
    }
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
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: AccountStatus, record: User) => {
        return (
          <Space direction="vertical" size={0}>
            <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
            {status === "RESTRICTED" && record.restrictedReason && (
              <span style={{ fontSize: "12px", color: "#666" }}>
                Причина: {record.restrictedReason}
              </span>
            )}
            {status === "BANNED" && record.banReason && (
              <span style={{ fontSize: "12px", color: "#666" }}>
                Причина: {record.banReason}
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole, record: User) => {
        const canChange = canManageUser(record);

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
    {
      title: "Действия",
      key: "actions",
      width: 200,
      render: (_: unknown, record: User) => {
        const canManage = canManageUser(record);

        if (!canManage) return null;

        if (record.status === "ACTIVE") {
          return (
            <Space>
              <Button
                type="text"
                size="small"
                icon={<WarningOutlined />}
                onClick={() => openBanModal(record, "restrict")}
                loading={loading === record.id}
                title="Ограничить доступ к публикациям"
              >
                Ограничить
              </Button>
              <Button
                type="text"
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => openBanModal(record, "ban")}
                loading={loading === record.id}
                title="Заблокировать аккаунт"
              >
                Заблокировать
              </Button>
            </Space>
          );
        }

        // Для RESTRICTED и BANNED показываем кнопку разблокировки
        return (
          <Popconfirm
            title="Снять ограничения?"
            onConfirm={() => handleUnban(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="text"
              size="small"
              icon={<UnlockOutlined />}
              loading={loading === record.id}
              title="Снять ограничения"
            >
              Разблокировать
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
      <Modal
        title={
          banType === "restrict"
            ? "Ограничить пользователя"
            : "Заблокировать пользователя"
        }
        open={banModalVisible}
        onOk={handleBan}
        onCancel={() => setBanModalVisible(false)}
        confirmLoading={loading === selectedUser?.id}
        okText={banType === "restrict" ? "Ограничить" : "Заблокировать"}
        cancelText="Отмена"
      >
        <p>
          {banType === "restrict"
            ? "Пользователь не сможет публиковать посты и события, но сможет войти в аккаунт."
            : "Пользователь не сможет войти в аккаунт."}
        </p>
        <Input.TextArea
          placeholder="Причина (обязательно)"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          rows={3}
        />
      </Modal>
    </>
  );
}
