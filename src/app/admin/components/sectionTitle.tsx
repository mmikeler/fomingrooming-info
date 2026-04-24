import { Divider } from "antd";

export default function SectionTitle({ title }: { title: string }) {
  return (
    <Divider titlePlacement="left">
      <span className="rounded-full bg-sky-600 px-4 py-1 text-lg text-white">
        {title}
      </span>
    </Divider>
  );
}
