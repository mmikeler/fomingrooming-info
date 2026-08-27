"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Card, Typography, App, Spin } from "antd";
import Link from "next/link";
import { resetPassword } from "./actions/reset-password";

const { Title, Text } = Typography;

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { message } = App.useApp();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // Проверка токена при загрузке
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    } else {
      setIsValidToken(true);
    }
  }, [token]);

  const onFinish = async (values: FormValues) => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (result.success) {
        message.success("Пароль успешно изменён");
        // Перенаправляем на страницу входа
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : JSON.stringify(result.error);
        message.error(errorMsg || "Произошла ошибка");
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Произошла ошибка при сбросе пароля");
      }
    } finally {
      setLoading(false);
    }
  };

  // Токен отсутствует
  if (isValidToken === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Title level={2}>Ошибка</Title>
            <Text type="secondary">Отсутствует токен для сброса пароля</Text>
          </div>
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              Запросить новую ссылку
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2}>Сброс пароля</Title>
          <Text type="secondary">Введите новый пароль для вашего аккаунта</Text>
        </div>

        <Form
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[
              { required: true, message: "Пожалуйста, введите новый пароль" },
              { min: 6, message: "Пароль должен быть не менее 6 символов" },
            ]}
          >
            <Input.Password placeholder="Новый пароль" />
          </Form.Item>

          <Form.Item
            label="Подтверждение пароля"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Пожалуйста, подтвердите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Подтвердите пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Изменить пароль
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <p>
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-500"
            >
              Войти
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
