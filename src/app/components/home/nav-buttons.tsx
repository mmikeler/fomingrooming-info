import { Flex } from "antd";
import Button from "../ui/button";

export default function NavButtonsBlock() {
  return (
    <div className="w-full overflow-x-auto p-2 pt-0">
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-5">
        <Button style={{ minWidth: "100px" }}>Работа</Button>
        <Button style={{ minWidth: "100px" }}>События</Button>
        <Button style={{ minWidth: "100px" }}>Новости</Button>
        <Button style={{ minWidth: "100px" }}>Эксперты</Button>
        <Button style={{ minWidth: "100px" }}>Маркет</Button>
        <Button style={{ minWidth: "100px" }}>Обзоры</Button>
      </div>
    </div>
  );
}
