// Registered users widget

import { formatDate } from "@/app/components/ui/date";
import { prisma } from "@/lib/prisma";
import { Avatar, Empty, Space } from "antd";
import Image from "next/image";

export async function RegisteredUsersWidget({ eventId }: { eventId: number }) {
  // Get registered users
  const getRegisteredUsers = async () => {
    try {
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });
      return registrations;
    } catch {
      return { error: "Ошибка получения данных" };
    }
  };

  const registrations = await getRegisteredUsers();

  if ("error" in registrations) {
    return registrations.error;
  }

  if (registrations.length === 0) {
    return <Empty />;
  }

  return (
    <div className="">
      {registrations.map((registration, index) => (
        <Space key={index} className="">
          {index + 1 + "."}
          <Avatar src={registration.user.avatar || ""} />
          {registration.user.name}
          {formatDate(registration.registeredAt)}
        </Space>
      ))}
    </div>
  );
}
