import Button from "../ui/button";
import { formatPrice } from "../ui/format";

export default function VACANCY_BAR() {
  const vacancy = [
    {
      title: "Грумер-стилист",
      description: "Полная стрижка, тримминг, оформление когтей",
      cost: 65000,
      address: "Салон «Собачья жизнь», г. Москва, ул. Пушкина, 15",
    },
    {
      title: "Мастер по стрижке когтей",
      description: "Стрижка когтей всем породам собак",
      cost: 35000,
      address: "Студия «Лапки-царапки», г. Санкт-Петербург, пр. Ленина, 42",
    },
    {
      title: "Грумер-универсал",
      description: "Комплексный уход за собаками всех пород",
      cost: 55000,
      address: "Груминг-центр «Пёс-плюс», г. Казань, ул. Гагарина, 8",
    },
    {
      title: "Помощник грумера",
      description: "Мытьё, сушка, расчёсывание собак",
      cost: 28000,
      address: "Салон «Чистый пёс», г. Новосибирск, ул. Советская, 23",
    },
    {
      title: "Грумер-эксперт",
      description: "Выставочный груминг, подготовка к шоу",
      cost: 85000,
      address: "Студия «Шоу-дог», г. Екатеринбург, пр. Мира, 100",
    },
    {
      title: "Мастер по триммингу",
      description: "Тримминг жесткошёрстных пород",
      cost: 48000,
      address: "Салон «Терьер-стайл», г. Нижний Новгород, ул. Кирова, 7",
    },
    {
      title: "Грумер-парикмахер",
      description: "Модельные стрижки, креативный груминг",
      cost: 72000,
      address: "Студия «Собачий кутюр», г. Самара, ул. Комсомольская, 31",
    },
    {
      title: "Грумер-парикмахер",
      description: "Модельные стрижки, креативный груминг",
      cost: 72000,
      address: "Студия «Собачий кутюр», г. Самара, ул. Комсомольская, 31",
    },
  ];

  return (
    <div className="">
      {vacancy.map((v, i) => {
        return (
          <div key={i} className="mt-6 rounded-md bg-white p-5 shadow">
            <div className="text-[15px] font-bold">{v.title}</div>
            <div className="text-[14px]">{v.description}</div>
            <div className="mt-2 text-[16px] font-bold">
              {formatPrice(v.cost)}
            </div>
            <div className="text-[14px]">{v.address}</div>
          </div>
        );
      })}
      <div className="mt-10">
        <Button type="link" href="/">
          Все вакансии
        </Button>
      </div>
    </div>
  );
}
