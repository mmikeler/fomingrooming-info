"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Form, Input, Card, Typography, App, Alert } from "antd";
import Link from "next/link";
import { register } from "./actions/register";
import { registerOAuthUser } from "./actions/registerOAuthUser";
import { signIn } from "next-auth/react";

const { Title } = Typography;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [registrationIsSuccessful, setRegistrationIsSuccessful] =
    useState(false);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const prefillEmail = searchParams.get("email") || "";
  const prefillName = searchParams.get("name") || "";
  const isOAuth = searchParams.get("provider") === "yandex";

  // Предзаполняем форму из query-параметров
  useEffect(() => {
    if (prefillEmail) {
      form.setFieldsValue({ email: prefillEmail });
    }
    if (prefillName) {
      form.setFieldsValue({ name: prefillName });
    }
  }, [prefillEmail, prefillName, form]);

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Для OAuth-регистрации пароль не требуется
    if (!isOAuth && values.password !== values.confirmPassword) {
      message.error("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      if (isOAuth) {
        // Регистрация через OAuth - без пароля
        const result = await registerOAuthUser({
          name: values.name,
          email: values.email,
        });

        if (result.success) {
          message.success("Регистрация прошла успешно!", 2);
          setRegistrationIsSuccessful(true);
        } else {
          message.error(result.error.message || "Ошибка при регистрации");
        }
      } else {
        // Обычная регистрация с паролем
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
          setRegistrationIsSuccessful(true);
        } else {
          message.error(result.error.message || "Ошибка при регистрации");
        }
      }
    } catch {
      message.error("Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  if (registrationIsSuccessful) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Title level={3}>Теперь вы можете войти</Title>
          </div>
          <div
            className="w-full cursor-pointer rounded-lg border-yellow-300 bg-yellow-200 p-2 text-center font-bold hover:opacity-80"
            role="button"
            onClick={() => signIn("yandex", { callbackUrl: "/in" })}
          >
            Войти
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Title level={2}>Регистрация</Title>
        </div>

        {isOAuth && (
          <Alert
            title="Регистрация через Яндекс"
            description="Заполните имя для завершения регистрации. Пароль не требуется."
            type="info"
            showIcon
            className="mb-6"
          />
        )}

        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ email: prefillEmail, name: prefillName }}
        >
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
            <Input placeholder="your@email.com" disabled={isOAuth} />
          </Form.Item>

          {!isOAuth && (
            <>
              <Form.Item
                label="Пароль"
                name="password"
                rules={[
                  { required: true, message: "Пожалуйста, введите пароль" },
                  {
                    min: 6,
                    message: "Пароль должен содержать минимум 6 символов",
                  },
                ]}
              >
                <Input.Password placeholder="Пароль" />
              </Form.Item>

              <Form.Item
                label="Подтверждение пароля"
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Пожалуйста, подтвердите пароль",
                  },
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
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isOAuth ? "Завершить регистрацию" : "Зарегистрироваться"}
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
