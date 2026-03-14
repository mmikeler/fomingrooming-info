import EventsList from "./components/EventsList";

export const metadata = {
  title: "Мероприятия | FomingRoomingInfo",
  description:
    "Список опубликованных мероприятий по грумингу и уходу за домашними животными",
};

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Мероприятия</h1>
        <p className="text-lg text-gray-600">
          Мастер-классы, семинары, выставки и другие мероприятия по грумингу
        </p>
      </div>

      <EventsList />
    </div>
  );
}
