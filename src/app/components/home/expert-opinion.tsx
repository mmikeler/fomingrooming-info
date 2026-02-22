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
      <Image
        src="https://picsum.dev/700/200?seed=98"
        width="700"
        height="200"
        alt=""
      />
      <Space className="mt-5">
        <span className="text-2xl">Иван Иванов |</span>
        <span className="text-xs">Тренер</span>
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
