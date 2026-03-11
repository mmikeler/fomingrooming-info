"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Card, Typography, App } from "antd";
import Link from "next/link";
import { forgotPassword } from "./actions/forgot-password";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const result = await forgotPassword(values.email);

      if (result.success) {
        message.success(result.message || "Проверьте вашу почту");
        // Через 3 секунды перенаправляем на страницу входа
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        message.error(result.error || "Произошла ошибка");
      }
    } catch {
      message.error("Произошла ошибка при отправке запроса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2}>Восстановление пароля</Title>
          <Text type="secondary">
            Введите ваш email, и мы отправим вам ссылку для сброса пароля
          </Text>
        </div>

        <Form
          name="forgot-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Пожалуйста, введите email" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input placeholder="your@email.com" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Отправить ссылку для сброса
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <p>
            Вспомнили пароль?{" "}
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
