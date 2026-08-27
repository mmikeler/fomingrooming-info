"use client";
// Компонент для добавления и настройки рекламного места

import { ADV } from "@/generated/prisma/client";
import { ADV_PLACES } from "@/generated/prisma/enums";
import {
  App,
  Divider,
  Form,
  FormInstance,
  Input,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { MessageCircleWarning } from "lucide-react";
import { updateADV } from "../actions/adv";
import { useRef, useState } from "react";
import { SETTINGS } from "./settings";
import { sanitizeUrl, sanitizeInput } from "@/utils/sanitize";
import { ADV_ITEM_IMAGE } from "./advItemImage";
import ADV_ITEM_OPTIONS from "./advItemOptions";

export type FormValues = {
  src: string;
  url: string;
  comment: string;
};

export function ADV_ITEM({ place, value }: { place: ADV_PLACES; value: ADV }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormInstance<FormValues>>(null);
  const [isMobileMode, setIsMobileMode] = useState(false);

  // Проверяем заполненность элемента
  const isEmpty = !value.url || !value.src;

  // Извлекаем размеры блока
  const size: number[] = (
    isMobileMode ? SETTINGS[place].mobileSize : SETTINGS[place].size
  )
    .split("x")
    .map((n) => parseInt(n));

  // Сохранение элемента
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

  return (
    <div className="">
      <Divider>
        <Space>
          <span>#{value.id}</span>
          {isEmpty && (
            <Tooltip title="У элемента отсутствует одно из обязательных полей. В этом случае он показываться не будет.">
              <MessageCircleWarning size={20} color="orange" />
            </Tooltip>
          )}
        </Space>
      </Divider>
      <div className="mb-1 flex items-center justify-between text-[14px] text-gray-500">
        <div className="">
          <span className="text-red-600">*</span>Ваш баннер:
        </div>
        {isMobileMode ? (
          <Tag color={"cyan"}>Мобильный</Tag>
        ) : (
          <Tag color={"blue"}>Полный</Tag>
        )}
      </div>
      <div className="flex gap-2 pb-5">
        <Form
          ref={formRef}
          layout="vertical"
          onFinish={onFinish}
          initialValues={value}
          className="w-full max-w-[calc(100%-50px)]"
        >
          <div
            className={`relative mx-auto w-full overflow-hidden object-cover`}
            style={{ maxWidth: size[0], aspectRatio: size[0] / size[1] }}
          >
            <ADV_ITEM_IMAGE adv={value} isMobileMode={isMobileMode} />
          </div>
          <div className="mt-5">
            <Form.Item
              label="Ссылка, куда ведёт баннер"
              name="url"
              rules={[
                { required: true, message: "Введите URL" },
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
        <ADV_ITEM_OPTIONS
          value={value}
          formRef={formRef}
          loading={loading}
          isMobileMode={isMobileMode}
          setIsMobileMode={setIsMobileMode}
        />
      </div>
    </div>
  );
}
