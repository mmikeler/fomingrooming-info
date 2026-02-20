import { Flex } from "antd";
import Button from "../ui/button";

export default function NavButtonsBlock() {
  return (
    <Flex gap="middle" style={{ marginTop: "0px" }}>
      <Button style={{ width: "100%" }}>Работа</Button>
      <Button style={{ width: "100%" }}>События</Button>
      <Button style={{ width: "100%" }}>Новости</Button>
      <Button style={{ width: "100%" }}>Эксперты</Button>
      <Button style={{ width: "100%" }}>Маркет</Button>
      <Button style={{ width: "100%" }}>Обзоры</Button>
    </Flex>
  );
}
