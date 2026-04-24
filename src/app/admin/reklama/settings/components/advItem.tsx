"use client";
// Компонент для добавления и настройки рекламного места

import { ADV } from "@/generated/prisma/client";
import { ADV_PLACES } from "@/generated/prisma/enums";
import { App, Button, Divider, Form, FormInstance, Input, Tooltip } from "antd";
import { Save, Trash } from "lucide-react";
import { deleteADV, updateADV } from "../actions/adv";
import { useRef, useState } from "react";
import { SETTINGS } from "./settings";
import { sanitizeUrl, sanitizeInput } from "@/utils/sanitize";
import { ADV_ITEM_IMAGE } from "./advItemImage";

type FormValues = {
  src: string;
  url: string;
  comment: string;
};

export function ADV_ITEM({ place, value }: { place: ADV_PLACES; value: ADV }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormInstance<FormValues>>(null);
  // Извлекаем размеры блока
  const size: number[] = SETTINGS[place].size
    .split("x")
    .map((n) => parseInt(n));

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      const sanitizedValues = {
        ...value,
        url: sanitizeUrl(values.url),
        comment: sanitizeInput(values.comment),
      };

      const res = await updateADV(sanitizedValues);

      if (res !== undefined && !res.success) {
        message.error({
          content: "Ошибка при обновлении элемента",
        });
      } else {
        message.success({
          content: "Элемент успешно обновлён",
        });
      }
    } catch (error) {
      console.log(error);

      message.error({
        content: "Произошла ошибка при обновлении",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendForm = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <div className="">
      <Divider>#{value.id}</Divider>
      <div className="text-[14px] text-gray-500">Ваш баннер:</div>
      <div className="flex gap-2 pb-5">
        <Form
          ref={formRef}
          layout="vertical"
          onFinish={onFinish}
          initialValues={value}
          className="w-full max-w-[calc(100%-50px)]"
        >
          <div
            className={`relative mx-auto max-w-full overflow-hidden object-cover`}
            style={{ width: size[0], height: size[1] }}
          >
            <ADV_ITEM_IMAGE adv={value} />
          </div>
          <div className="mt-5">
            <Form.Item
              label="Ссылка, куда ведёт баннер"
              name="url"
              rules={[
                { required: false, message: "Введите URL" },
                { type: "url", message: "Введите корректный URL" },
                { max: 300, message: "Максимум 500 символов" },
              ]}
            >
              <Input
                showCount
                maxLength={300}
                name="url"
                type="text"
                placeholder="https://example.com"
              />
            </Form.Item>
          </div>
          <div className="mt-5">
            <Form.Item
              label="Служебный комментарий"
              rules={[{ max: 500, message: "Максимум 500 символов" }]}
              name="comment"
            >
              <Input
                name="comment"
                type="text"
                placeholder="Комментарий к элементу"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </div>
        </Form>
        <div className="flex w-full max-w-12 flex-col items-center justify-start gap-1 border-l border-gray-200 pl-2">
          <Tooltip title="Удалить элемент">
            <Button
              style={{ padding: "5px 12px" }}
              color="danger"
              variant="solid"
              onClick={() => deleteADV(value)}
            >
              <Trash size={16} />
            </Button>
          </Tooltip>
          <div className="mx-auto my-1 h-px w-5 bg-gray-300"></div>
          <Tooltip title="Сохранить элемент">
            <Button
              color="green"
              variant="solid"
              style={{ padding: "5px 12px" }}
              onClick={sendForm}
              loading={loading}
            >
              <Save size={16} />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
