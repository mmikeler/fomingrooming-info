import { ArrowRightOutlined } from "@ant-design/icons";
import { Card, Space } from "antd";
import Image from "next/image";
import Button from "../ui/button";

export default function EVENT_BAR() {
  return (
    <>
      <div className="text-[10px] uppercase">
        Ближайшие мероприятия в твоём городе
      </div>
      <div className="relative mt-3 rounded-lg bg-black">
        <Image
          className="w-full"
          src="/div1.png"
          width={700}
          height={500}
          alt=""
        />
      </div>
      <div className="mt-5 flex gap-5">
        <Card
          key="vac_1"
          style={{ width: "100%" }}
          variant="borderless"
          cover={
            <img
              draggable={false}
              alt="example"
              src="https://picsum.dev/400/200?seed=12"
            />
          }
        >
          <div className="font-bold">
            Открытое первенство Москвы по грумингу
          </div>
          <div className="mt-1 text-xs">10 марта 2026</div>
        </Card>
        <Card
          key="vac_2"
          style={{ width: "100%" }}
          variant="borderless"
          cover={
            <img
              draggable={false}
              alt="example"
              src="https://picsum.dev/400/200?seed=12"
            />
          }
        >
          <div className="font-bold">
            Открытое первенство Москвы по грумингу
          </div>
          <div className="mt-1 text-xs">17 мая 2026</div>
        </Card>
      </div>
      <div className="mt-5 flex justify-end">
        <Button>
          <Space>
            Все мероприятия <ArrowRightOutlined />
          </Space>
        </Button>
      </div>
    </>
  );
}
