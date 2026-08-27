import { Space } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Image from "next/image";
import Link from "next/link";

type BlogPostProps = {
  title: string;
  description: string;
  image: string;
};

export default function ExpertOpinion() {
  return (
    <>
      <div className="relative w-full overflow-hidden rounded-lg">
        <Image
          src="https://picsum.dev/700/200?seed=98"
          fill
          alt=""
          className="h-40 w-full object-cover sm:h-48 md:h-auto"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 700px"
        />
      </div>
      <Space className="mt-5 flex-wrap">
        <span className="text-xl sm:text-2xl">Ivan Ivanov |</span>
        <span className="text-xs">Trainer</span>
      </Space>
      <div className="mt-2">
        <Paragraph ellipsis={{ rows: 10 }}>
          Welcome to Burger Bliss, where we take your cravings to a whole new
          level! Our mouthwatering burgers are made from 100% beef and are
          served on freshly baked buns. Welcome to Burger Bliss, where we take
          your cravings to a whole new level! Our mouthwatering burgers are made
          from 100% beef and are served on freshly baked buns. Welcome to Burger
          Bliss, where we take your cravings to a whole new level! Our
          mouthwatering burgers are made from 100% beef and are served on
          freshly baked buns. Welcome to Burger Bliss, where we take your
          cravings to a whole new level! Our mouthwatering burgers are made from
          100% beef and are served on freshly baked buns. Welcome to Burger
          Bliss, where we take your cravings to a whole new level! Welcome to
          Burger Bliss, where we take your cravings to a whole new level! Our
          mouthwatering burgers are made from 100% beef and are served on
          freshly baked buns. Welcome to Burger Bliss, where we take your
          cravings to a whole new level! Welcome to Burger Bliss, where we take
          your cravings to a whole new level! Our mouthwatering burgers are made
          from 100% beef and are served on freshly baked buns.
        </Paragraph>
      </div>
      <Link href="/" className="mt-5 block text-right">
        Читать целиком
      </Link>
    </>
  );
}
