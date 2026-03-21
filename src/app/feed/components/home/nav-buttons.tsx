import Button from "@/app/components/ui/button";

export default function NavButtonsBlock() {
  return (
    <div className="w-full overflow-x-auto p-2 pt-0">
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-5">
        <Button href="#vacancies" style={{ minWidth: "100px" }}>
          Работа
        </Button>
        <Button href="#events" style={{ minWidth: "100px" }}>
          События
        </Button>
        <Button href="#news" style={{ minWidth: "100px" }}>
          Новости
        </Button>
        <Button href="#experts" style={{ minWidth: "100px" }}>
          Эксперты
        </Button>
        <Button href="#market" style={{ minWidth: "100px" }}>
          Маркет
        </Button>
        <Button href="#reviews" style={{ minWidth: "100px" }}>
          Обзоры
        </Button>
      </div>
    </div>
  );
}
