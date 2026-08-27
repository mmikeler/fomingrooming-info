"use client";

import { Space, Flex } from "antd";
import { Header as AntHeader } from "antd/es/layout/layout";
import Link from "next/link";
import Image from "next/image";
import UserAuthWidget from "@/app/components/ui/user-auth-widget";
import { SearchPanel } from "@/app/components/search-form";
import Navigation from "@/app/components/ui/navigation";

export function Header() {
  return (
    <AntHeader
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <div className="container mx-auto hidden p-2 lg:block">
        <Flex justify="space-between">
          <Space size="large">
            <Link
              className="text-[10px] text-(--foreground)! uppercase"
              href="/"
            >
              О проекте
            </Link>
            <Link
              className="text-[10px] text-(--foreground)! uppercase"
              href="/"
            >
              Реклама на сайте
            </Link>
            <Link
              className="text-[10px] text-(--foreground)! uppercase"
              href="/"
            >
              Техподдержка
            </Link>
          </Space>

          <UserAuthWidget />
        </Flex>
      </div>

      <div className="flex items-center justify-between bg-(--foreground) p-2 lg:rounded-[25px] lg:p-6">
        <Link
          href="/"
          className="relative flex h-10 w-28 items-center lg:h-13 lg:w-33"
        >
          <Image
            fill
            style={{ objectFit: "contain" }}
            src={"/logo.svg"}
            alt="Фомин Груминг Инфо"
          />
        </Link>

        <div className="max-w-90">
          <SearchPanel />
        </div>

        <div className="ms-auto lg:hidden">
          <UserAuthWidget />
        </div>
        <Navigation />
      </div>
    </AntHeader>
  );
}
