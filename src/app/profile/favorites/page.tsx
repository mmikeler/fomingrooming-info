import { redirect } from "next/navigation";
import { getFavoriteEvents } from "@/app/favorites/actions/favorites";
import { FavoriteEventsList } from "./components/FavoriteEventsList";

export default async function FavoriteEventsPage() {
  const result = await getFavoriteEvents();

  // Если ошибка авторизации - редирект на страницу входа
  if (!result.success) {
    if (result.error.code === "UNAUTHORIZED") {
      redirect("/auth/signin");
    }
    // Для других ошибок показываем сообщение
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Избранное</h1>
        <p className="text-red-500">Ошибка: {result.error.message}</p>
      </div>
    );
  }

  const events = result.data;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Избранное</h1>
      <FavoriteEventsList events={events} />
    </div>
  );
}
