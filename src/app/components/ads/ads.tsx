import { ADV_PLACES } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Suspense } from "react";

export default async function ADS({ place }: { place: ADV_PLACES }) {
  const ADVData = await prisma.aDV.findMany({
    where: {
      place: place,
    },
  });

  const adv = ADVData[0];

  if (!adv)
    return (
      <div className="flex h-full items-center justify-center border border-amber-100 bg-amber-50 p-1">
        Это рекламное место свободно
      </div>
    );

  //const size = SETTINGS[place].size.split("x");

  return (
    <Suspense
      fallback={
        <div className="animate-pulse text-center font-bold text-rose-500 uppercase">
          ADS PLACE #{place}
        </div>
      }
    >
      <div className="relative h-full w-full rounded-lg bg-rose-100">
        <Image src={adv.src} alt="" fill style={{ objectFit: "cover" }} />
      </div>
    </Suspense>
  );
}
