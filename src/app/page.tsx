import { Layout, Typography } from "antd";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import BlogWidget from "./components/blog-widget";

export default function Home() {
  return (
    <Layout
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <main className="relative w-full px-6 sm:items-start lg:px-16">
        <section
          id="fs"
          className="relative container mx-auto flex min-h-[calc(100dvh-48px)]"
        >
          <Image
            width={500}
            height={1000}
            src={"/fp.png"}
            alt=""
            className="invisible absolute top-0 right-0 h-full w-auto lg:visible"
            loading="eager"
          />
          <div className="my-auto">
            <Title
              className="text-3xl! uppercase sm:text-5xl!"
              style={{ color: "var(--foreground)" }}
            >
              Фомингруминг <span className="text-[80%]">инфо</span>
            </Title>
            <Typography className="titlefont text-xl!">
              Информационный портал для грумеров. <br />
              События, бренды и <span className="text-[120%]">знания</span> в
              одном месте
            </Typography>
          </div>
        </section>
        <section id="blog-widget" className="py-20 lg:py-30">
          <Title
            level={2}
            className="mt-10 block text-center lg:mb-20!"
            style={{ color: "var(--foreground)" }}
          >
            Новое в блоге
          </Title>
          <BlogWidget />
        </section>
      </main>
    </Layout>
  );
}
