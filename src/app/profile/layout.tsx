import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import { ProfileMenu } from "./components/profile-menu";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout>
      <Sider theme="light">
        <ProfileMenu />
      </Sider>
      <Content style={{ position: "relative" }}>
        <div className="container mx-auto flex min-h-[calc(100dvh-130px)] px-4 py-8">
          {children}
        </div>
      </Content>
    </Layout>
  );
}
