import Button from "@/app/components/ui/button";
import { formatPrice } from "@/app/components/ui/format";
import { EyeOutlined, HeartOutlined } from "@ant-design/icons";

export default function VACANCY_BAR() {
  const vacancy = [
    {
      title: "Грумер-стилист",
      description: "Полная стрижка, тримминг, оформление когтей",
      cost: 65000,
      address: "Салон «Собачья жизнь», г. Москва, ул. Пушкина, 15",
      likes: 2467,
      views: 1567,
    },
    {
      title: "Мастер по стрижке когтей",
      description: "Стрижка когтей всем породам собак",
      cost: 35000,
      address: "Студия «Лапки-царапки», г. Санкт-Петербург, пр. Ленина, 42",
      likes: 1245,
      views: 89345,
    },
    {
      title: "Грумер-универсал",
      description: "Комплексный уход за собаками всех пород",
      cost: 55000,
      address: "Груминг-центр «Пёс-плюс», г. Казань, ул. Гагарина, 8",
      likes: 18,
      views: 203,
    },
    {
      title: "Помощник грумера",
      description: "Мытьё, сушка, расчёсывание собак",
      cost: 28000,
      address: "Салон «Чистый пёс», г. Новосибирск, ул. Советская, 23",
      likes: 8,
      views: 67,
    },
    {
      title: "Грумер-эксперт",
      description: "Выставочный груминг, подготовка к шоу",
      cost: 85000,
      address: "Студия «Шоу-дог», г. Екатеринбург, пр. Мира, 100",
      likes: 31,
      views: 287,
    },
    {
      title: "Мастер по триммингу",
      description: "Тримминг жесткошёрстных пород",
      cost: 48000,
      address: "Салон «Терьер-стайл», г. Нижний Новгород, ул. Кирова, 7",
      likes: 15,
      views: 134,
    },
    {
      title: "Грумер-парикмахер",
      description: "Модельные стрижки, креативный груминг",
      cost: 72000,
      address: "Студия «Собачий кутюр», г. Самара, ул. Комсомольская, 31",
      likes: 22,
      views: 198,
    },
  ];

  return (
    <div className="max-w-105">
      {vacancy.map((v, i) => {
        return (
          <div key={i} className="mt-6 rounded-md bg-white p-5 shadow">
            <div className="text-[15px] font-bold">{v.title}</div>
            <div className="text-[14px]">{v.description}</div>
            <div className="mt-2 text-[16px] font-bold">
              {formatPrice(v.cost)}
            </div>
            <div className="flex items-center justify-between gap-5">
              <div className="text-[10px]">{v.address}</div>
              <div className="flex items-center justify-end gap-4 text-[12px] text-gray-500">
                <span className="flex items-center gap-1">
                  <EyeOutlined />
                  {v.views}
                </span>
                <span className="flex items-center gap-1">
                  <HeartOutlined />
                  {v.likes}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div className="mt-10">
        <Button className="w-fit" href="/">
          Все вакансии
        </Button>
      </div>
    </div>
  );
}
