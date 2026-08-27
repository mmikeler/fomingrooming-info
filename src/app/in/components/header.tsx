"use client";

import UserAuthWidget from "@/app/components/ui/user-auth-widget";
import { Flex } from "antd";
import { Header as AntHeader } from "antd/es/layout/layout";
import Image from "next/image";

export function Header() {
  return (
    <AntHeader>
      <div className="container mx-auto max-w-285 rounded-lg bg-(--foreground) p-2">
        <Flex align="center" justify="space-between">
          <Image
            width={80}
            height={80}
            src={"/logo.svg"}
            alt="Фомин Груминг Инфо"
          />

          <div className="rounded bg-white">
            <UserAuthWidget />
          </div>

          {/* Место для мобильного меню */}
          <div id="mobileBar" className="lg:hidden"></div>
        </Flex>
      </div>
    </AntHeader>
  );
}
