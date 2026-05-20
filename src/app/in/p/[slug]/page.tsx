import fs from "fs";
import path from "path";

import { Card, Empty } from "antd";
import MDContent from "../components/load_content";
import { PageMeta } from "../components/meta";
import { Metadata } from "next";

// Получаем markdown контент из каталога "/content" соответственно значению slug.
async function getContent(slug: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      `src/app/in/p/content/${slug}.md`,
    );
    return fs.readFileSync(filePath, "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

// Создаём страницу
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const content = await getContent(slug);

  if (!content)
    return (
      <div className="flex h-full items-center justify-center">
        <Empty description="Такая страница не существует" />
      </div>
    );

  return (
    <div className="mx-auto max-w-185 py-10">
      <Card title={PageMeta[slug].title}>
        <MDContent content={content} />
      </Card>
    </div>
  );
}

// Генерируем мета-данные
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { title, description } = PageMeta[slug];

  return {
    title,
    description,
  };
}
