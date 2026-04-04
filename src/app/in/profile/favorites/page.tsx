import { redirect } from "next/navigation";
import { getAllFavorites } from "@/app/in/favorites/actions/favorites";
import { FavoriteItemsList } from "./components/FavoriteItemsList";

export default async function FavoritePage() {
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

  const items = result.data;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Закладки</h1>
      <FavoriteItemsList items={items} />
    </div>
  );
}
