import { ArrowUpOutlined } from "@ant-design/icons";
import Link from "next/link";

type NewsItem = {
  title: string;
  slug: string;
  content: string;
  createdAt: string;
};

export default function NEWS_BAR() {
  const news: NewsItem[] = [
    {
      title: "Как правильно мыть собаку",
      slug: "how-to-wash-dog",
      content:
        "Используйте специальный шампунь для собак. Температура воды должна быть 37-38°C.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      title: "Стрижка когтей: советы",
      slug: "nail-trimming-tips",
      content:
        "Стригите когти каждые 2-3 недели. Используйте только качественный триммер.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      title: "Уход за шерстью",
      slug: "coat-care",
      content:
        "Расчёсывайте шерсть ежедневно. Это предотвращает образование колтунов и линьку.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      title: "Чистка ушей питомца",
      slug: "ear-cleaning",
      content:
        "Чистите уши раз в неделю. Используйте специальные лосьоны для чистки ушей.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      title: "Выбор грумера",
      slug: "choosing-groomer",
      content:
        "Ищите сертифицированных грумеров с хорошими отзывами от клиентов.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      title: "Груминг щенков",
      slug: "puppy-grooming",
      content:
        "Приучайте щенка к грумингу с раннего возраста. Начинайте с коротких процедур.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      title: "Зубы собаки: уход",
      slug: "dental-care",
      content:
        "Чистите зубы собаке 2-3 раза в неделю специальной зубной пастой для животных.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      title: "Сезонный груминг",
      slug: "seasonal-grooming",
      content:
        "Летом стригите собаку короче, зимой оставляйте больше шерсти для тепла.",
      createdAt: new Date().toLocaleDateString(),
    },
  ];

  return news.map((news, index) => {
    return (
      <div className="mt-5 border-b pb-5" key={index}>
        <Link
          href={"/"}
          className="relative block pr-4 font-bold text-(--foreground)!"
        >
          {news.title}
          <div className="absolute top-0 right-0">
            <ArrowUpOutlined className="rotate-45" />
          </div>
        </Link>
        <div className="mt-1">{news.content}</div>
        <div className="mt-3">{news.createdAt}</div>
      </div>
    );
  });
}
