"use server";

import { ADV_PLACES } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ADV } from "@/generated/prisma/client";

/**
 * Получает список рекламных баннеров для указанного рекламного места.
 *
 * @param place - Рекламное место (из перечисления ADV_PLACES).
 * @returns Массив рекламных записей {@link ADV}.
 */
export default async function getAdvData(place: ADV_PLACES): Promise<ADV[]> {
  return await prisma.aDV.findMany({
    where: {
      place: place,
    },
  });
}
