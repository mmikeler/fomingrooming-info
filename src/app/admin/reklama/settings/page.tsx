// Страница с настройками рекламы

import SectionTitle from "../../components/sectionTitle";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { ADV_PLACES } from "@/generated/prisma/enums";
import { ADV } from "@/generated/prisma/client";
import ADV_PLACE from "./components/advPlace";
import { Card, Divider, Space } from "antd";
import Link from "next/link";
import { ArrowUpFromLineIcon } from "lucide-react";

export default async function Page() {
  const PLACES: Record<ADV_PLACES, ADV[]> = {
    FP_SIDER_ONE: [],
    FP_SIDER_TWO: [],
    FP_SIDER_THREE: [],
    FP_CONTENT_ONE: [],
    FP_CONTENT_TWO: [],
    FP_CONTENT_THREE: [],
    TOPBAR: [],
    SIDER: [],
    ALL: [],
    POSTS: [],
    EVENTS: [],
  };

  const advs = await prisma.aDV.findMany();

  advs.forEach((adv) => {
    if (PLACES[adv.place]) {
      PLACES[adv.place].push(adv);
    }
  });

  return (
    <Suspense fallback="Загрузка...">
      <SectionTitle title="Настройки рекламы" />
      <div className="flex">
        <div id="up" className="mx-auto flex max-w-185 flex-col gap-5">
          {Object.entries(PLACES as Record<ADV_PLACES, ADV[]>).map(
            ([place, values], index: number) => (
              <ADV_PLACE
                key={index}
                place={place as ADV_PLACES}
                values={values}
              />
            ),
          )}
        </div>
        {/* NAV */}
        <div className="relative">
          <div className="sticky top-6">
            <Card title="Навигация">
              <div className="flex flex-col">
                {Object.keys(PLACES).map((key) => (
                  <Link href={"#" + key} className="mb-1" key={key}>
                    {key}
                  </Link>
                ))}
                <Divider />
                <Link href="#up">
                  <Space>
                    <ArrowUpFromLineIcon size={16} /> {"Наверх"}
                  </Space>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
