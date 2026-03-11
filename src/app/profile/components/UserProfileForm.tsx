"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin, Form, Input, message } from "antd";
import { updateProfile } from "../actions/updateProfile";
import { getUser } from "../actions/getUser";
import { AvatarUploader } from "./AvatarUploader";
import { ChangePasswordForm } from "./ChangePasswordForm";

interface UserData {
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  avatar: string | null;
}

export function UserProfileForm() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      if (status === "loading") return;

      const user = await getUser();

      if (!user) {
        router.push("/auth/signin");
        return;
      }

      setUserData({
        name: user.name,
        email: user.email,
        city: user.city,
        phone: user.phone,
        avatar: user.avatar,
      });
      setAvatar(user.avatar);
      setInitialLoading(false);
    }

    fetchUser();
  }, [status, router]);

  const handleSubmit = async (values: UserData) => {
    setLoading(true);
    try {
      const result = await updateProfile({
        name: values.name,
        city: values.city || undefined,
        phone: values.phone || undefined,
        avatar: avatar,
      });

      if (result.success) {
        message.success("Профиль успешно обновлён");

        // Обновляем данные сессии
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            name: values.name,
            city: values.city,
            phone: values.phone,
          },
        });

        // Обновляем локальные данные
        setUserData({
          name: values.name,
          email: values.email,
          city: values.city || null,
          phone: values.phone || null,
          avatar: avatar,
        });
      } else {
        message.error(result.error?.message || "Ошибка при обновлении профиля");
      }
    } catch (error) {
      message.error("Произошла ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (newAvatar: string | null) => {
    // Блокируем повторные вызовы во время сохранения
    if (isAvatarSaving) return;

    setAvatar(newAvatar);

    // Автоматически сохраняем изменение аватарки в базе данных
    if (newAvatar !== userData?.avatar) {
      setIsAvatarSaving(true);
      try {
        const result = await updateProfile({
          name: userData?.name || "",
          city: userData?.city || undefined,
          phone: userData?.phone || undefined,
          avatar: newAvatar,
        });

        if (result.success) {
          message.success(
            newAvatar ? "Аватарка обновлена" : "Аватарка удалена",
          );
          // Обновляем данные сессии
          await updateSession({
            ...session,
            user: {
              ...session?.user,
              image: newAvatar,
            },
          });
        } else {
          message.error(
            result.error?.message || "Ошибка при обновлении аватарки",
          );
          // Откатываем локальное состояние при ошибке
          setAvatar(userData?.avatar || null);
        }
      } catch (error) {
        message.error("Ошибка при обновлении аватарки");
        // Откатываем локальное состояние при ошибке
        setAvatar(userData?.avatar || null);
      } finally {
        setIsAvatarSaving(false);
      }
    }
  };

  if (initialLoading || !userData) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-2 lg:p-8">
      <AvatarUploader
        currentAvatar={avatar}
        userName={userData?.name || ""}
        onAvatarChange={handleAvatarChange}
      />

      <div className="mt-10">
        <Form
          layout="horizontal"
          labelCol={{ span: 8 }}
          labelAlign="left"
          initialValues={userData}
          onFinish={handleSubmit}
          className="flex flex-col gap-2"
          variant="underlined"
        >
          <Form.Item
            label="Имя Фамилия"
            name="name"
            rules={[
              { required: true, message: "Пожалуйста, введите имя" },
              { min: 2, message: "Имя должно содержать минимум 2 символа" },
              { max: 100, message: "Имя не должно превышать 100 символов" },
            ]}
          >
            <Input
              size="large"
              placeholder="Ваше имя"
              className="py-2 text-xl! font-semibold"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                message: "Введите корректный email",
              },
            ]}
          >
            <Input disabled className="py-2 text-xl! font-semibold" />
          </Form.Item>

          <Form.Item
            label="Город"
            name="city"
            rules={[
              {
                max: 100,
                message: "Название города не должно превышать 100 символов",
              },
            ]}
          >
            <Input
              placeholder="Ваш город"
              className="py-2 text-xl! font-semibold"
            />
          </Form.Item>

          <Form.Item
            label="Телефон"
            name="phone"
            rules={[
              {
                pattern: /^[\d\s\-\+\(\)]{7,20}$/,
                message: "Введите корректный номер телефона",
              },
            ]}
          >
            <Input
              placeholder="+7 999 123-45-67"
              className="py-2 text-xl! font-semibold"
            />
          </Form.Item>

          <Form.Item>
            <button
              type="submit"
              disabled={loading}
              className="btn mx-auto mt-5 block px-3 py-4 lg:px-7 lg:py-5"
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </Form.Item>
        </Form>

        <div className="mt-8 border-t pt-6">
          <h3 className="mb-4 text-lg font-semibold">Безопасность</h3>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
