"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Card, Typography, App, Alert } from "antd";
import Link from "next/link";
import { Mail } from "lucide-react";

const { Title } = Typography;

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [showUnverifiedAlert, setShowUnverifiedAlert] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setShowUnverifiedAlert(false);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setShowUnverifiedAlert(true);
          message.warning(
            "Пожалуйста, подтвердите ваш email. Проверьте почту для подтверждения.",
          );
        } else if (result.error.startsWith("ACCOUNT_BANNED")) {
          // Извлекаем причину бана из сообщения об ошибке
          const banReason = result.error.replace("ACCOUNT_BANNED:", "");
          message.error(
            banReason
              ? `Ваш аккаунт заблокирован. Причина: ${banReason}`
              : "Ваш аккаунт заблокирован. Свяжитесь с администратором.",
          );
        } else {
          message.error("Неверный email или пароль");
        }
      } else {
        message.success("Вход выполнен успешно");
        router.push("/in");
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

        {showUnverifiedAlert && (
          <Alert
            message="Email не подтверждён"
            description={
              <span>
                Пожалуйста, подтвердите ваш email. Если письмо не пришло, вы
                можете{" "}
                <Link
                  href="/auth/resend-verification"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  запросить новое письмо
                </Link>
              </span>
            }
            type="warning"
            showIcon
            icon={<Mail className="h-4 w-4" />}
            className="mb-6"
          />
        )}

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
