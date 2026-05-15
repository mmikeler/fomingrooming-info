"use server";

import { prisma } from "@/lib/prisma";

interface Contact {
  name: string;
  phone: string | null;
  email: string | null;
}

/**
 * Получение контактов пользователя по slug
 * Возвращает контакты только если пользователь разрешил их показывать
 */
export async function getUserContacts(slug: string): Promise<Contact | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        phone: true,
        showContacts: true,
        email: true,
      },
    });

    if (!user) {
      return null;
    }

    // Проверяем, разрешил ли пользователь показывать контакты
    if (!user.showContacts) {
      return null;
    }

    // Возвращаем контакты
    return {
      name: user.name,
      phone: user.phone,
      email: user.email,
    };
  } catch (error) {
    console.error("Error fetching user contacts:", error);
    return null;
  }
}
