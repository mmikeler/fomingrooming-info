import EventsList from "./components/EventsList";

export const metadata = {
  title: "Мероприятия | FomingRoomingInfo",
  description:
    "Список опубликованных мероприятий по грумингу и уходу за домашними животными",
};

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <EventsList />
    </div>
  );
}
