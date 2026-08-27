import { redirect } from "next/navigation";
import { getUserRegisteredEvents } from "./actions/getUserRegistrations";
import { RegisteredEventsList } from "./components/RegisteredEventsList";

export default async function RegisteredEventsPage() {
  const result = await getUserRegisteredEvents();

  // Если ошибка авторизации - редирект на страницу входа
  if (!result.success) {
    if (result.error.code === "UNAUTHORIZED") {
      redirect("/auth/signin");
    }
    // Для других ошибок показываем сообщение
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Участие в мероприятиях</h1>
        <p className="text-red-500">Ошибка: {result.error.message}</p>
      </div>
    );
  }

  const events = result.data;

  return (
    <div className="container mx-auto max-w-185 p-4">
      <h1 className="mb-6 text-2xl font-bold">Участие в мероприятиях</h1>
      <RegisteredEventsList events={events} />
    </div>
  );
}
