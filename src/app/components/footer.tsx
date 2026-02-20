import { Footer as AntFooter } from "antd/es/layout/layout";
import { Copyright } from "./copyright";
import Image from "next/image";
import Link from "next/link";
import { Flex } from "antd";

export function Footer() {
  return (
    <AntFooter
      style={{
        backgroundColor: "var(--foreground)",
        color: "white",
      }}
    >
      <div className="mx-auto mb-10 w-full overflow-hidden rounded-b-lg px-5 py-15">
        <Flex justify="space-between">
          <Link href="/" className="relative flex h-13 w-33 items-center">
            <Image
              fill
              style={{ objectFit: "contain" }}
              src={"/logo.png"}
              alt="Фомин Груминг Инфо"
            />
          </Link>
          <div className="uppercase">
            <div className="">sobaka@sobaka.ru</div>
            <div className="">+7 999 999 99 99</div>
            <div className="">г.Москва</div>
          </div>
        </Flex>
        <Copyright />
      </div>
    </AntFooter>
  );
}
