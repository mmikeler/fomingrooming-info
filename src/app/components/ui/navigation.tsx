"use client";

import { CheckSquareOutlined, DownOutlined } from "@ant-design/icons";
import { Divider, Drawer, Dropdown, Flex, MenuProps, Space } from "antd";
import Image from "next/image";
import { ReactElement, useState } from "react";

type MenuItem = {
  key: string;
  label: ReactElement | string;
  icon?: ReactElement;
  children?: MenuItem[];
};

export default function Navigation() {
  const [visible, setVisible] = useState(false);

  const navItems: MenuItem[] = [
    {
      key: "l1",
      label: "Найти мероприятие",
      children: [
        {
          key: "1",
          label: "Мастеркласс",
          icon: <CheckSquareOutlined />,
        },
        {
          key: "2",
          label: "Онлайн-конференция",
          icon: <CheckSquareOutlined />,
        },
        {
          key: "3",
          label: "Оффлайн-конференция",
          icon: <CheckSquareOutlined />,
        },
      ],
    },
    {
      key: "l2",
      label: "Найти работу",
      children: [
        {
          key: "1",
          label: "Онлайн",
          icon: <CheckSquareOutlined />,
        },
        {
          key: "2",
          label: "Оффлайн",
          icon: <CheckSquareOutlined />,
        },
        {
          key: "3",
          label: "Подработка",
          icon: <CheckSquareOutlined />,
        },
      ],
    },
    {
      key: "l3",
      label: "Продать инструмент",
      children: [
        {
          key: "1",
          label: "Новый",
          icon: <CheckSquareOutlined />,
        },
        {
          key: "2",
          label: "Б/У",
          icon: <CheckSquareOutlined />,
        },
      ],
    },
    {
      key: "l4",
      label: "Найти бренд",
      children: [
        {
          key: "1",
          label: "Инструменты",
          icon: <CheckSquareOutlined />,
        },
        {
          key: "2",
          label: "Корма",
          icon: <CheckSquareOutlined />,
        },
        {
          key: "3",
          label: "Франшиза",
          icon: <CheckSquareOutlined />,
        },
      ],
    },
  ];

  const extNavItems: MenuItem[] = [
    {
      key: "l5",
      label: "О проекте",
    },
    {
      key: "l6",
      label: "Реклама на сайте",
    },
    {
      key: "l7",
      label: "Техподдержка",
    },
  ];

  return (
    <>
      {/* Меню */}
      <Space size="large">
        <div className="hidden gap-8 lg:flex">
          {navItems.map((item, index: number) => {
            return (
              <div
                key={index}
                className="cursor-pointer text-[16px] text-white"
              >
                <Dropdown menu={{ items: item.children }}>
                  <Space>
                    {item.label}
                    <DownOutlined style={{ fontSize: "12px" }} />
                  </Space>
                </Dropdown>
              </div>
            );
          })}
        </div>
        <div className="cursor-pointer" onClick={() => setVisible(true)}>
          <Image
            src="/menu-bar.png"
            width={40}
            height={40}
            alt="fomin-gruming-info"
          />
        </div>
      </Space>

      {/* Мобильное меню */}
      <Drawer closable open={visible} onClose={() => setVisible(false)}>
        <Flex vertical gap="large">
          {navItems.map((item, index: number) => {
            return (
              <div key={index} className="text-[16px]">
                <div className="mt-1 mb-1 font-bold">{item.label}</div>
                {item.children &&
                  item.children.length > 0 &&
                  item.children.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="mt-2 cursor-pointer ps-4 hover:underline"
                      >
                        {item.label}
                      </div>
                    );
                  })}
              </div>
            );
          })}
          <Divider />
          <div>
            {extNavItems.map((item, index) => {
              return (
                <div key={index} className="mt-2">
                  {item.label}
                </div>
              );
            })}
          </div>
        </Flex>
      </Drawer>
    </>
  );
}
