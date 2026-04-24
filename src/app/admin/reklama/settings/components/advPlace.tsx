"use client";

import { ADV } from "@/generated/prisma/client";
import { ADV_PLACES } from "@/generated/prisma/enums";
import { App, Button, Card, Empty, Tooltip } from "antd";
import { useState } from "react";
import { createADV } from "../actions/adv";
import { SETTINGS } from "./settings";
import { ADV_ITEM } from "./advItem";
import { Plus } from "lucide-react";

//

export default function ADV_PLACE({
  place,
  values,
}: {
  place: ADV_PLACES;
  values: ADV[];
}) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const add = async () => {
    try {
      setLoading(true);
      const res = await createADV(place);

      if (res !== undefined && !res.success) {
        message.error({
          content: "Ошибка при добавлении элемента",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="mt-5 rounded border p-5"
      title={
        <>
          <div className="text-[14px]">{place}</div>
          <div className="text-sm opacity-70">
            {SETTINGS[place].note} {SETTINGS[place].size}px
          </div>
        </>
      }
    >
      <div>
        {/* Если элементов ещё нет */}
        {values.length === 0 && <Empty description="Нет элементов" />}

        {/* Если элементы есть */}
        {values.map((value, index) => (
          <ADV_ITEM key={index} place={place} value={value} />
        ))}
      </div>
      {/* Кнопка добавления */}
      <Tooltip title="Добавить элемент">
        <Button
          className="mt-10 w-full bg-stone-100!"
          onClick={add}
          loading={loading}
        >
          <Plus color="gray" />
        </Button>
      </Tooltip>
    </Card>
  );
}
