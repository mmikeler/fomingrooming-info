"use client";

import { useState } from "react";
import { Button, Spin, message } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import { getUserContacts } from "../actions/getUserContacts";

interface Contact {
  name: string;
  phone: string | null;
  email: string | null;
}

interface ContactButtonProps {
  slug: string;
  showContacts: boolean;
}

/**
 * Клиентский компонент для отображения контактов по клику
 */
export function ContactButton({ slug, showContacts }: ContactButtonProps) {
  const [contacts, setContacts] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Если пользователь не разрешил показывать контакты, не показываем кнопку
  if (!showContacts) {
    return null;
  }

  const handleToggle = () => {
    if (contacts || error) {
      setIsOpen(!isOpen);
    } else {
      fetchContacts();
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserContacts(slug);

      if (!data) {
        throw new Error("Не удалось загрузить контакты");
      }

      setContacts(data);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      message.error(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button
        type="default"
        icon={<ContactsOutlined />}
        onClick={handleToggle}
        loading={loading}
        className="flex items-center gap-2"
      >
        Показать контакты
      </Button>

      {isOpen && contacts && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-semibold">Контакты</h3>
          <div className="flex flex-col gap-2">
            {contacts.email && (
              <a
                href={`mailto:${encodeURIComponent(contacts.email)}`}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <MailOutlined />
                {contacts.email}
              </a>
            )}
            {contacts.phone && (
              <a
                href={`tel:${encodeURIComponent(contacts.phone)}`}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <PhoneOutlined />
                {contacts.phone}
              </a>
            )}
            {!contacts.email && !contacts.phone && (
              <p className="text-gray-500">Контакты не указаны</p>
            )}
          </div>
        </div>
      )}

      {isOpen && error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
