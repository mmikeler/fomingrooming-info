"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Card, Typography, App } from "antd";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { resendVerification } from "./actions/resend-verification";

const { Title, Text } = Typography;

export default function ResendVerificationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const result = await resendVerification({ email: values.email });

      if (result.success) {
        message.success(result.data.message);
      } else {
        // Обработка ошибок
        if (result.error.code === "RATE_LIMITED") {
          message.warning(result.error.message);
        } else if (result.error.code === "VALIDATION") {
          message.error(result.error.message);
        } else {
          // Для других ошибок показываем общее сообщение (чтобы не раскрывать детали)
          message.success(
            "Если такой аккаунт существует и email не подтверждён, письмо было отправлено",
          );
        }
      }
    } catch (error) {
      message.error("Произошла ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <Title level={3}>Повторная отправка письма</Title>
          <Text type="secondary">
            Введите email, указанный при регистрации, и мы отправим вам новое
            письмо с подтверждением
          </Text>
        </div>

        <Form
          name="resend-verification"
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
            <Input
              prefix={<Mail className="h-4 w-4 text-gray-400" />}
              placeholder="your@email.com"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<Send className="h-4 w-4" />}
            >
              Отправить повторно
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Вернуться к входу
          </Link>
        </div>
      </Card>
    </div>
  );
}
