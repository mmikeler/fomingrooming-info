import { Layout } from "antd";
import Title from "antd/es/typography/Title";
import NavButtonsBlock from "./components/home/nav-buttons";
import NEWS_BAR from "./components/home/news-bar";
import ADS from "./components/ads/ads";
import VACANCY_BAR from "./components/home/vacancy-bar";
import EVENT_BAR from "./components/home/events-bar";
import ExpertOpinion from "./components/home/expert-opinion";
import MARKET_BAR from "./components/home/market-bar";

export default function Home() {
  return (
    <Layout
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <main className="relative w-full p-2 py-6 lg:px-6">
        <div className="w-full">
          <NavButtonsBlock />
        </div>
        <div className="wrap mt-7 flex gap-8">
          <div className="max-w-50">
            <div className="mb-5 h-75 w-full">
              <ADS place="HOMEPAGE_NEWSBAR" />
            </div>
            <Title level={2}>Новости</Title>
            <NEWS_BAR />
          </div>
          <div className="w-full">
            <div className="wrap flex gap-8">
              <div className="rounded-2xl bg-[#EDF4FF80] p-5">
                <Title level={2}>Вакансии</Title>
                <VACANCY_BAR />
              </div>
              <div className="w-full max-w-175">
                <EVENT_BAR />
                <Title className="mt-10" level={2}>
                  Экспертиза
                </Title>
                <div className="mt-4">
                  <ExpertOpinion />
                </div>
              </div>
            </div>
            <div className="my-8 h-40 w-full">
              <ADS place="HOMEPAGE_MAIN" />
            </div>
            <div className="mt-10">
              <Title level={2}>Маркет</Title>
              <div className="mt-8">
                <MARKET_BAR />
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
