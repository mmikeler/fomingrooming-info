"use server";

import { ADV } from "@/generated/prisma/client";
import { ADV_PLACES } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createADV(place: ADV_PLACES) {
  try {
    await prisma.aDV.create({
      data: {
        place: place,
      },
    });

    revalidatePath("/admin/reklama/settings");
  } catch (error) {
    return { success: false, error: error };
  }
}

export async function updateADV(adv: ADV) {
  try {
    await prisma.aDV.update({
      where: { id: adv.id },
      data: {
        src: adv.src || "",
        mobileSrc: adv.mobileSrc || "",
        url: adv.url || "",
        comment: adv.comment || "",
      },
    });

    revalidatePath("/admin/reklama/settings");
  } catch (error) {
    return { success: false, error: error };
  }
}

export async function deleteADV(adv: ADV) {
  try {
    await prisma.aDV.delete({
      where: { id: adv.id },
    });

    revalidatePath("/admin/reklama/settings");
  } catch (error) {
    return { success: false, error: error };
  }
}
