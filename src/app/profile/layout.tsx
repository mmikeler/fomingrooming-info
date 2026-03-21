import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import ProfileSidebar from "./components/sidebar";
import { Header } from "./components/header";

export default function ProfileLayout({
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
