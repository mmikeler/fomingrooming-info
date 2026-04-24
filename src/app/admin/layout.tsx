import { Content } from "antd/es/layout/layout";
import Sidebar from "./components/sidebar";
import { Layout } from "antd";
import Header from "./components/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <Layout>
        <Sidebar />
        <Layout>
          <Header />
          <Content>
            <div className="container mx-auto px-4 pb-8">
              <div>
                <section>{children}</section>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
