"use client";

import { useState } from "react";
import { Form, Input, message, Button } from "antd";
import { changePassword } from "../actions/changePassword";
import { LockOutlined, KeyOutlined } from "@ant-design/icons";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      const result = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (result.success) {
        message.success("Пароль успешно изменён");
        form.resetFields();
        setIsExpanded(false);
      } else {
        message.error(result.error?.message || "Ошибка при изменении пароля");
      }
    } catch (error) {
      message.error("Произошла ошибка при изменении пароля");
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        icon={<KeyOutlined />}
        className="mt-4"
        onClick={() => setIsExpanded(true)}
      >
        Изменить пароль
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-semibold">Изменение пароля</h4>
        <Button
          type="text"
          size="small"
          onClick={() => {
            setIsExpanded(false);
            form.resetFields();
          }}
        >
          Отмена
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        variant="underlined"
      >
        <Form.Item
          label="Текущий пароль"
          name="currentPassword"
          rules={[{ required: true, message: "Введите текущий пароль" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Ваш текущий пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Новый пароль"
          name="newPassword"
          rules={[
            { required: true, message: "Введите новый пароль" },
            { min: 6, message: "Пароль должен содержать минимум 6 символов" },
            { max: 100, message: "Пароль не должен превышать 100 символов" },
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="Новый пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Подтвердите пароль"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Подтвердите пароль" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Пароли должны совпадать"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Подтвердите новый пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="btn"
          >
            {loading ? "Сохранение..." : "Сохранить пароль"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
