import { CheckSquareOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown, Flex, MenuProps, Space } from "antd";
import Image from "next/image";

type navItem = {
  label: string;
  children: MenuProps["items"];
};

export default function Navigation() {
  const navItems: navItem[] = [
    {
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

  return (
    <Space size="large">
      <Flex gap="large">
        {navItems.map((item, index: number) => {
          return (
            <div key={index} className="cursor-pointer text-[16px] text-white">
              <Dropdown menu={{ items: item.children }}>
                <Space>
                  {item.label}
                  <DownOutlined style={{ fontSize: "12px" }} />
                </Space>
              </Dropdown>
            </div>
          );
        })}
      </Flex>
      <Image src="/menu-bar.png" width={40} height={40} alt="menu bar" />
    </Space>
  );
}
