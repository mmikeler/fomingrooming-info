import { Layout } from "antd";
import NavButtonsBlock from "./components/home/nav-buttons";
import NEWS_BAR from "./components/home/news-bar";
import ADS from "../components/ads/ads";
import VACANCY_BAR from "./components/home/vacancy-bar";
import EVENT_BAR from "./components/home/events-bar";
import ExpertOpinion from "./components/home/expert-opinion";
import MARKET_BAR from "./components/home/market-bar";
import Button from "../components/ui/button";
import { ArrowRightOutlined } from "@ant-design/icons";
import ACTUAL_POSTS from "./components/home/actual_posts";
import NOTES_POSTS from "./components/home/notes";
import USEFUL_POSTS from "./components/home/useful_posts";
import Title from "antd/es/typography/Title";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Layout
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <main className="relative w-full py-6 lg:p-2 lg:px-6">
        <div className="w-full">
          <NavButtonsBlock />
        </div>
        <div className="mt-7 flex gap-8 lg:flex-row">
          {/* Сайдбар - скрывается на мобильных */}
          <div className="hidden w-full max-w-50 shrink-0 lg:block">
            <ADS place="FP_SIDER_ONE" className="mb-5 h-75 w-full" />

            <div id="news">
              <Title level={2}>Новости</Title>
              <NEWS_BAR />
            </div>

            <ADS place="FP_SIDER_TWO" className="my-5 h-75 w-full" />

            <Title level={2}>Статьи</Title>
            <NEWS_BAR categories={["ARTICLE"]} count={5} />

            <ADS place="FP_SIDER_THREE" className="my-5 h-75 w-full" />
          </div>
          {/* Основной контент */}
          <div className="w-full min-w-0">
            <section id="events" className="flex flex-col gap-8 lg:flex-row">
              {/* Виджет вакансий */}
              <div
                id="vacancies"
                className="order-2 rounded-2xl bg-[#EDF4FF80] p-2 py-5 lg:order-1 lg:p-5"
              >
                <Title level={2} className="text-center lg:text-left">
                  Вакансии
                </Title>
                <VACANCY_BAR />
              </div>
              {/* События и экспертиза */}
              <div className="order-1 w-full min-w-0 p-2 lg:order-2 lg:max-w-175 lg:p-0">
                <EVENT_BAR />
                <div id="experts">
                  <Title className="mt-10 text-center lg:text-left" level={2}>
                    Экспертиза
                  </Title>
                  <div className="mt-4">
                    <ExpertOpinion />
                  </div>
                </div>
              </div>
            </section>
            <section>
              <ADS place="FP_CONTENT_ONE" className="my-8 h-40 w-full" />
            </section>
            <section id="market" className="mt-10 p-2 lg:p-0">
              <Title level={2} className="text-center lg:text-left">
                Маркет
              </Title>
              <div className="mt-8">
                <MARKET_BAR />
                <div className="ms-auto mt-6 w-fit">
                  <Button href="/">
                    Все объявления <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            </section>
            <section id="reviews" className="mt-10 p-2 lg:p-0">
              <Title level={2} className="text-center lg:text-left">
                Актуальное
              </Title>
              <div className="mt-8">
                <ACTUAL_POSTS />
              </div>
            </section>
            <section>
              <ADS place="FP_CONTENT_TWO" className="my-8 h-40 w-full" />
            </section>
            <section className="mt-10 p-2 lg:p-0">
              <Title level={2} className="text-center lg:text-left">
                Заметки
              </Title>
              <div className="mt-8">
                <NOTES_POSTS />
              </div>
            </section>
            <section className="mt-10 p-2 lg:p-0">
              <Title level={2} className="text-center lg:text-left">
                Полезное
              </Title>
              <div className="mt-8">
                <USEFUL_POSTS />
              </div>
            </section>
            <section>
              <ADS place="FP_CONTENT_THREE" className="my-8 h-40 w-full" />
            </section>
          </div>
        </div>
      </main>
    </Layout>
  );
}
