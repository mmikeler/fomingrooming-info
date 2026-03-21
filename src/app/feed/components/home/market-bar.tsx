import { Card } from "antd";
import Image from "next/image";
import { EyeOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import { formatPrice } from "@/app/components/ui/format";

export default function MARKET_BAR() {
  const products = [
    {
      image: "https://picsum.dev/300/300?seed=98",
      name: "Professional grooming scissors",
      price: 4500,
      inFavorite: false,
      vews: 3420,
      favorites: 856,
    },
    {
      image: "https://picsum.dev/300/300?seed=99",
      name: "Furminator for dogs medium",
      price: 2800,
      inFavorite: true,
      vews: 5100,
      favorites: 1234,
    },
    {
      image: "https://picsum.dev/300/300?seed=100",
      name: "Mat breaker with rotating blades",
      price: 950,
      inFavorite: false,
      vews: 1890,
      favorites: 423,
    },
    {
      image: "https://picsum.dev/300/300?seed=101",
      name: "Grooming comb set (5 pcs)",
      price: 1650,
      inFavorite: false,
      vews: 2780,
      favorites: 612,
    },
    {
      image: "https://picsum.dev/300/300?seed=102",
      name: "Folding grooming table",
      price: 12500,
      inFavorite: true,
      vews: 890,
      favorites: 234,
    },
    {
      image: "https://picsum.dev/300/300?seed=103",
      name: "Professional pet hair dryer",
      price: 7800,
      inFavorite: false,
      vews: 4560,
      favorites: 987,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((p, i) => {
        return (
          <Card
            variant="borderless"
            key={i}
            cover={
              <div className="relative overflow-hidden">
                <Image
                  src={p.image}
                  draggable={false}
                  width={400}
                  height={400}
                  alt="example"
                  className="h-auto w-full object-cover"
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
              <div key={1} className="text-[10px] sm:text-[12px]">
                {formatPrice(p.price)}
              </div>,
              <div key={2} className="text-[10px] sm:text-[12px]">
                <EyeOutlined /> {p.vews}
              </div>,
              <div key={3} className="text-[10px] sm:text-[12px]">
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
