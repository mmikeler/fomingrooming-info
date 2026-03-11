import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import ProfileSidebar from "./components/sidebar";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-130px)] py-8">
      <Layout>
        <ProfileSidebar />
        <Layout>
          <Content>{children}</Content>
        </Layout>
      </Layout>
    </div>
  );
}
