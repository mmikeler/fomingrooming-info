import { redirect } from "next/navigation";
import FavoritePostsList from "./components/favoritesPostsList";
import { getAllFavorites } from "./actions/favorites";

export default async function FavoriteEventsPage() {
  const result = await getAllFavorites();

  // Если ошибка авторизации - редирект на страницу входа
  if (!result.success) {
    if (result.error.code === "UNAUTHORIZED") {
      redirect("/auth/signin");
    }
    // Для других ошибок показываем сообщение
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Закладки</h1>
        <p className="text-red-500">Ошибка: {result.error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <FavoritePostsList posts={result.data} />
    </div>
  );
}
