import { redirect } from "next/navigation";
import { getUserEvents } from "./actions/getUserEvents";
import { EventsTable } from "./components/EventsTable";

export default async function EventsPage() {
  const result = await getUserEvents();

  // Если ошибка авторизации - редирект на страницу входа
  if (!result.success) {
    if (result.error.code === "UNAUTHORIZED") {
      redirect("/auth/signin");
    }
    // Для других ошибок показываем сообщение
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Мои мероприятия</h1>
        <p className="text-red-500">Ошибка: {result.error.message}</p>
      </div>
    );
  }

  const events = result.data;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Мои мероприятия</h1>
      <EventsTable events={events} />
      {events.length === 0 && <p className="mt-4">У вас нет мероприятий.</p>}
    </div>
  );
}
