import { Card } from "antd";
import Image from "next/image";
import { formatPrice } from "../ui/format";
import { EyeOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";

export default function MARKET_BAR() {
  const products = [
    {
      image: "https://picsum.dev/300/300?seed=98",
      name: "Ножницы грумерские профессиональные",
      price: 4500,
      inFavorite: false,
      vews: 3420,
      favorites: 856,
    },
    {
      image: "https://picsum.dev/300/300?seed=99",
      name: "Фурминатор для собак средний",
      price: 2800,
      inFavorite: true,
      vews: 5100,
      favorites: 1234,
    },
    {
      image: "https://picsum.dev/300/300?seed=100",
      name: "Колтунорез с вращающимися лезвиями",
      price: 950,
      inFavorite: false,
      vews: 1890,
      favorites: 423,
    },
    {
      image: "https://picsum.dev/300/300?seed=101",
      name: "Набор расчесок для груминга (5 шт)",
      price: 1650,
      inFavorite: false,
      vews: 2780,
      favorites: 612,
    },
    {
      image: "https://picsum.dev/300/300?seed=102",
      name: "Стол для груминга складной",
      price: 12500,
      inFavorite: true,
      vews: 890,
      favorites: 234,
    },
    {
      image: "https://picsum.dev/300/300?seed=103",
      name: "Фен профессиональный для сушки животных",
      price: 7800,
      inFavorite: false,
      vews: 4560,
      favorites: 987,
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
      {products.map((p, i) => {
        return (
          <Card
            variant="borderless"
            key={i}
            cover={
              <div className="overflow-hidden">
                <Image
                  src={p.image}
                  draggable={false}
                  width={400}
                  height={400}
                  alt="example"
                />
                <div className="absolute top-2 right-2 cursor-pointer">
                  {!p.inFavorite ? (
                    <HeartOutlined className={`text-2xl text-white!`} />
                  ) : (
                    <HeartFilled className="text-2xl text-red-500!" />
                  )}
                </div>
              </div>
            }
            actions={[
              <div key={1} className="text-[12px]">
                {formatPrice(p.price)}
              </div>,
              <div key={1} className="text-[12px]">
                <EyeOutlined /> {p.vews}
              </div>,
              <div key={2} className="text-[12px]">
                <HeartOutlined /> {p.favorites}
              </div>,
            ]}
          >
            <div className="min-h-10">
              <Paragraph style={{ fontSize: "10px" }} ellipsis={{ rows: 2 }}>
                {p.name}
              </Paragraph>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
