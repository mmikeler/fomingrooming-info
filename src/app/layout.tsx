import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { Providers } from "../components/providers";
import App from "antd/es/app/App";

const titleFont = Jost({
  variable: "--font-goo-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "ФОМИНГРУМИНГ ИНФО",
  description:
    "Информационный портал для грумеров. События, бренды и знания в одном месте",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-notoserif-sans)",
          colorText: "var(--foreground)",
        },
        components: {
          Button: {
            defaultColor: "var(--background)",
          },
          Typography: {
            colorText: "var(--foreground)",
            colorTextHeading: "var(--foreground)",
            fontSizeHeading2: 35,
          },
        },
      }}
    >
      <html lang="ru">
        <body className={`${titleFont.variable} antialiased`}>
          <Providers>
            <App>
              <div className="m-auto max-w-360 bg-white lg:rounded-xl">
                <Header />
                {children}
                <Footer />
              </div>
            </App>
          </Providers>
        </body>
      </html>
    </ConfigProvider>
  );
}
