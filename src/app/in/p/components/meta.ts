export type PageMetaMap = {
  [K: string]: {
    title: string;
    description: string;
  };
};

export const PageMeta: PageMetaMap = {
  about: {
    title: "О проекте",
    description: "Информация о проекте FomingRoomingInfo",
  },
  reklama: {
    title: "Реклама",
    description: "О размещении рекламы на сайте FomingRoomingInfo",
  },
  help: {
    title: "Помощь",
    description: "Информация о том, как пользоваться сайтом FomingRoomingInfo",
  },
};
