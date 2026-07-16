// Button to go back

"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function BackButton({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  return (
    <Button
      href={url}
      type="link"
      className="text-sky-500"
      icon={<ArrowLeftOutlined />}
    >
      {label}
    </Button>
  );
}
