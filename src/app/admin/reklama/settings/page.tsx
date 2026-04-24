// Страница с настройками рекламы

import SectionTitle from "../../components/sectionTitle";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { ADV_PLACES } from "@/generated/prisma/enums";
import { ADV } from "@/generated/prisma/client";
import ADV_PLACE from "./components/advPlace";

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
      <div className="mx-auto flex max-w-185 flex-col gap-5">
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
    </Suspense>
  );
}
