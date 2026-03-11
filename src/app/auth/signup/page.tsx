"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Card, Typography, App } from "antd";
import Link from "next/link";
import { register } from "./actions/register";

const { Title } = Typography;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        message.success(
          "Регистрация прошла успешно! На ваш email отправлена ссылка для подтверждения. Пожалуйста, проверьте почту.",
          5,
        );
        router.push("/auth/signin");
      } else {
        message.error(result.error.message || "Ошибка при регистрации");
      }
    } catch {
      message.error("Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2}>Регистрация</Title>
        </div>

        <Form name="signup" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            label="Имя"
            name="name"
            rules={[{ required: true, message: "Пожалуйста, введите имя" }]}
          >
            <Input placeholder="Ваше имя" />
          </Form.Item>

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
            rules={[
              { required: true, message: "Пожалуйста, введите пароль" },
              { min: 6, message: "Пароль должен содержать минимум 6 символов" },
            ]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          <Form.Item
            label="Подтверждение пароля"
            name="confirmPassword"
            rules={[
              { required: true, message: "Пожалуйста, подтвердите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
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
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <p>
            Уже есть аккаунт?{" "}
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
