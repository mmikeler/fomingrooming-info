// Настройки рекламнах мест

import { ADV_PLACES } from "@/generated/prisma/enums";

const SIZES = {
  S1: "200x300",
  S2: "1160x200",
  S3: "640x200",
  S4: "180x250",
  S5: "1140x50",
  SM: "330x440",
};

export const SETTINGS: Record<ADV_PLACES, { [key: string]: string }> = {
  [ADV_PLACES.FP_SIDER_ONE]: {
    size: SIZES.S1,
    mobileSize: SIZES.SM,
    note: "Блок в начале сайдбара промо-лендинга.",
  },
  [ADV_PLACES.FP_SIDER_TWO]: {
    size: SIZES.S1,
    mobileSize: SIZES.SM,
    note: "Блок в середине сайдбара промо-лендинга.",
  },
  [ADV_PLACES.FP_SIDER_THREE]: {
    size: SIZES.S1,
    mobileSize: SIZES.SM,
    note: "Блок в конце сайдбара промо-лендинга.",
  },
  [ADV_PLACES.FP_CONTENT_ONE]: {
    size: SIZES.S2,
    mobileSize: SIZES.SM,
    note: "Блок в начале контента промо-лендинга.",
  },
  [ADV_PLACES.FP_CONTENT_TWO]: {
    size: SIZES.S2,
    mobileSize: SIZES.SM,
    note: "Блок в середине контента промо-лендинга.",
  },
  [ADV_PLACES.FP_CONTENT_THREE]: {
    size: SIZES.S2,
    mobileSize: SIZES.SM,
    note: "Блок в конце контента промо-лендинга.",
  },
  [ADV_PLACES.ALL]: {
    size: SIZES.S3,
    mobileSize: SIZES.SM,
    note: "Блок в общей ленте.",
  },
  [ADV_PLACES.POSTS]: {
    size: SIZES.S3,
    mobileSize: SIZES.SM,
    note: "Блок в ленте постов.",
  },
  [ADV_PLACES.EVENTS]: {
    size: SIZES.S3,
    mobileSize: SIZES.SM,
    note: "Блок в ленте мероприятий.",
  },
  [ADV_PLACES.SIDER]: {
    size: SIZES.S4,
    mobileSize: SIZES.SM,
    note: "Блок в сайдбаре.",
  },
  [ADV_PLACES.TOPBAR]: {
    size: SIZES.S5,
    mobileSize: SIZES.SM,
    note: "Блок в топбаре.",
  },
};
