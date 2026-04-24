import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Divider } from "antd";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <>
      <Divider titlePlacement="left">
        <span className="rounded-full bg-sky-600 px-4 py-1 text-lg text-white">
          Сводка по порталу
        </span>
      </Divider>
      TODO: Добавить аналитику
    </>
  );
}
