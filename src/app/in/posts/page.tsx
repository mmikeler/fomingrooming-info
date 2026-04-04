import PostsList from "./components/PostsList";

/**
 * Страница поиска постов пользователя
 */
export default function PostsPage() {
  return (
    <div className="container mx-auto max-w-185 p-4">
      <PostsList />
    </div>
  );
}
