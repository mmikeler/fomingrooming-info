import { Layout, Space } from "antd";
import Title from "antd/es/typography/Title";
import NavButtonsBlock from "./components/home/nav-buttons";
import NEWS_BAR from "./components/home/news-bar";
import ADS from "./components/ads/ads";
import VACANCY_BAR from "./components/home/vacancy-bar";
import EVENT_BAR from "./components/home/events-bar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <Layout
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <main className="relative w-full py-6">
        <div className="w-full">
          <NavButtonsBlock />
        </div>
        <div className="wrap mt-7 flex gap-8">
          <div className="max-w-50">
            <div className="mb-5 h-75 w-full overflow-hidden rounded-lg">
              <ADS />
            </div>
            <Title level={2}>Новости</Title>
            <NEWS_BAR />
          </div>
          <div className="w-full">
            <div className="wrap flex gap-8">
              <div className="rounded-md bg-[#EDF4FF80] p-5">
                <Title level={2}>Вакансии</Title>
                <VACANCY_BAR />
              </div>
              <div className="w-full max-w-175">
                <EVENT_BAR />
                <Title className="mt-10" level={2}>
                  Экспертиза
                </Title>
                <div className="mt-4">
                  <Image
                    src="https://picsum.dev/700/200?seed=12"
                    width="700"
                    height="200"
                    alt=""
                  />
                  <Space className="mt-5">
                    <span className="text-2xl">Иван Иванов |</span>
                    <span className="text-xs">Тренер</span>
                  </Space>
                  <div className="mt-2">
                    Welcome to Burger Bliss, where we take your cravings to a
                    whole new level! Our mouthwatering burgers are made from
                    100% beef and are served on freshly baked buns. Welcome to
                    Burger Bliss, where we take your cravings to a whole new
                    level! Our mouthwatering burgers are made from 100% beef and
                    are served on freshly baked buns. Welcome to Burger Bliss,
                    where we take your cravings to a whole new level! Our
                    mouthwatering burgers are made from 100% beef and are served
                    on freshly baked buns. Welcome to Burger Bliss, where we
                    take your cravings to a whole new level! Our mouthwatering
                    burgers are made from 100% beef and are served on freshly
                    baked buns. Welcome to Burger Bliss, where we take your
                    cravings to a whole new level! Welcome to Burger Bliss,
                    where we take your cravings to a whole new level! Our
                    mouthwatering burgers are made from 100% beef and are served
                    on freshly baked buns. Welcome to Burger Bliss, where we
                    take your cravings to a whole new level! Welcome to Burger
                    Bliss, where we take your cravings to a whole new level! Our
                    mouthwatering burgers are made from 100% beef and are served
                    on freshly baked buns.
                  </div>
                  <Link href="/" className="mt-5 block text-right">
                    Читать целиком
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
