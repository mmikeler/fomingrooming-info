// Бар с опциями для элемента рекламного места

import { Button, FormInstance, Tooltip } from "antd";
import { MonitorSmartphone, Save, Trash } from "lucide-react";
import { deleteADV } from "../actions/adv";
import { Dispatch, RefObject, SetStateAction } from "react";
import { FormValues } from "./advItem";
import { ADV } from "@/generated/prisma/client";

export default function ADV_ITEM_OPTIONS({
  formRef,
  loading,
  value,
  isMobileMode,
  setIsMobileMode,
}: {
  formRef: RefObject<FormInstance<FormValues> | null>;
  loading: boolean;
  value: ADV;
  isMobileMode: boolean;
  setIsMobileMode: Dispatch<SetStateAction<boolean>>;
}) {
  // Отправка формы
  const sendForm = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
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
      <Tooltip title="Переключатель для мобильного варианта">
        <Button
          style={{ padding: "5px 12px" }}
          color="cyan"
          variant="solid"
          onClick={() => setIsMobileMode(!isMobileMode)}
        >
          <MonitorSmartphone size={16} />
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
  );
}
