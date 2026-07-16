// Класс для работы с постами (новостями)

import { PostCategory } from "@/generated/prisma/enums";
import BaseFeedRecord, { InitialPost } from "./BaseFeedRecord";

export default class FeedPost extends BaseFeedRecord {
  constructor(r: InitialPost) {
    super(r);
    this.content = r.content;
    this.category = r.category;
  }

  content: string | null;
  category: PostCategory;
}
