import { ArrowRightOutlined } from "@ant-design/icons";
import { Card, Space } from "antd";
import Image from "next/image";
import Button from "../ui/button";

export default function EVENT_BAR() {
  return (
    <div className="p-2 lg:p-0">
      <div className="text-[10px] uppercase">
        Ближайшие мероприятия в твоём городе
      </div>
      <div className="relative mt-3 overflow-hidden rounded-lg">
        <Image
          className="w-full object-cover"
          src="/div1.png"
          width={700}
          height={500}
          alt=""
        />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card
          key="vac_1"
          style={{ width: "100%" }}
          variant="borderless"
          cover={
            <Image
              draggable={false}
              width={400}
              height={200}
              alt="example"
              src="https://picsum.dev/400/200?seed=12"
              className="h-40 object-cover"
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
            <Image
              draggable={false}
              width={400}
              height={200}
              alt="example"
              src="https://picsum.dev/400/200?seed=13"
              className="h-40 object-cover"
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
    </div>
  );
}
