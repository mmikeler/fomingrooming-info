import { getUserPosts } from "./actions/getUserPosts";
import { PostsTable } from "./components/PostsTable";

export default async function PostsPage() {
  const posts = await getUserPosts();

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Мои посты</h1>
      <PostsTable posts={posts} />
      {posts.length === 0 && <p className="mt-4">У вас нет постов.</p>}
    </div>
  );
}
