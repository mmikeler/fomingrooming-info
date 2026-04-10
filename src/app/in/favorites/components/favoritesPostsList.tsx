import PostCard from "@/app/components/post/postCard";
import { FeedItem } from "../../lenta/types";

export default async function FavoritePostsList({
  posts,
}: {
  posts: FeedItem[];
}) {
  return (
    <div className="mx-auto max-w-185">
      {posts.length < 1 && (
        <p className="">
          Список пуст. Нажмите на значок закладки любой записи и она опявится
          здесь.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {posts.map((post: FeedItem, index: number) => (
          <PostCard key={index} post={post} />
        ))}
      </div>
    </div>
  );
}
