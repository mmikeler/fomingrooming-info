import { getUserPosts } from "./actions/getUserPosts";
import { PostsTable } from "./components/PostsTable";
import { redirect } from "next/navigation";

export default async function PostsPage() {
  const result = await getUserPosts();

  // Если ошибка авторизации - редирект на страницу входа
  if (!result.success) {
    if (result.error.code === "UNAUTHORIZED") {
      redirect("/auth/signin");
    }
    // Для других ошибок показываем сообщение
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Мои посты</h1>
        <p className="text-red-500">Ошибка: {result.error.message}</p>
      </div>
    );
  }

  const posts = result.data;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Мои посты</h1>
      <PostsTable posts={posts} />
      {posts.length === 0 && <p className="mt-4">У вас нет постов.</p>}
    </div>
  );
}
