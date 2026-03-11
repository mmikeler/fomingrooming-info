"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Card, Typography, App } from "antd";
import Link from "next/link";

const { Title } = Typography;

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          message.warning(
            "Пожалуйста, подтвердите ваш email. Проверьте почту для подтверждения.",
          );
        } else {
          message.error("Неверный email или пароль");
        }
      } else {
        message.success("Вход выполнен успешно");
        router.push("/profile");
      }
    } catch (error) {
      message.error("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2}>Вход</Title>
        </div>

        <Form name="signin" onFinish={onFinish} layout="vertical" size="large">
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

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: "Пожалуйста, введите пароль" }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Забыли пароль?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <p>
            Нет аккаунта?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-500"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
