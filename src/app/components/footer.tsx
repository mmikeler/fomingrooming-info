import { Footer as AntFooter } from "antd/es/layout/layout";
import { Copyright } from "./copyright";
import Image from "next/image";
import Link from "next/link";
import { Flex } from "antd";

const navLinkStyle = "text-white! uppercase hover:underline! tracking-[2px]";

export function Footer() {
  return (
    <AntFooter>
      <div className="mx-auto mb-10 w-full overflow-hidden rounded-b-2xl bg-(--foreground) px-5 py-15 text-[10px] text-white">
        <Flex justify="space-between">
          <Link href="/" className="relative flex h-13 w-33 items-center">
            <Image
              fill
              style={{ objectFit: "contain" }}
              src={"/logo.png"}
              alt="Фомин Груминг Инфо"
            />
          </Link>

          <Flex gap={10} orientation="vertical">
            <Link href="/" className={navLinkStyle}>
              События
            </Link>
            <Link href="/" className={navLinkStyle}>
              Вакансии
            </Link>
            <Link href="/" className={navLinkStyle}>
              Новости
            </Link>
          </Flex>

          <Flex gap={10} orientation="vertical">
            <Link href="/" className={navLinkStyle}>
              Сотрудничество
            </Link>
            <Link href="/" className={navLinkStyle}>
              Разместить объявление
            </Link>
            <Link href="/" className={navLinkStyle}>
              Обратная связь
            </Link>
          </Flex>

          <Flex gap={10} orientation="vertical">
            <Link href="/" className={navLinkStyle}>
              Реклама на сайте
            </Link>
            <Link href="/" className={navLinkStyle}>
              О проекте
            </Link>
            <Link href="/" className={navLinkStyle}>
              Техподдержка
            </Link>
          </Flex>

          <Flex gap={10} orientation="vertical">
            <Link href="/" className={navLinkStyle}>
              Политика конфиденциальности
            </Link>
            <Link href="/" className={navLinkStyle}>
              Оферта
            </Link>
            <Link href="/" className={navLinkStyle}>
              Пользовательское соглашение
            </Link>
          </Flex>

          <Flex gap={10} orientation="vertical">
            <div className={navLinkStyle}>sobaka@sobaka.ru</div>
            <div className={navLinkStyle}>+7 999 999 99 99</div>
            <div className={navLinkStyle}>г.Москва</div>
          </Flex>
        </Flex>
        <Copyright />
      </div>
    </AntFooter>
  );
}
