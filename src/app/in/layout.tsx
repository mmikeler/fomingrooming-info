import { Layout } from "antd";
import { Header } from "./components/header";
import ProfileSidebar from "./components/sidebar";
import { Content } from "antd/es/layout/layout";

export default async function InLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="container mx-auto flex min-h-[calc(100dvh-130px)] max-w-285">
        <Layout>
          <ProfileSidebar />
          <Layout>
            <Content style={{ backgroundColor: "var(--gray-background)" }}>
              {children}
            </Content>
          </Layout>
        </Layout>
      </div>
    </>
  );
}
