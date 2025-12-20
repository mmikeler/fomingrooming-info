import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import "./globals.css";
import { ConfigProvider, Layout } from "antd";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { Providers } from "../components/providers";
import App from "antd/es/app/App";

const titleFont = Noto_Serif({
  variable: "--font-notoserif-sans",
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
        },
        components: {
          Button: {
            defaultColor: "var(--background)",
          },
          Typography: {
            colorText: "var(--foreground)",
          },
        },
      }}
    >
      <html lang="ru">
        <body className={`${titleFont.variable} antialiased`}>
          <Providers>
            <App>
              <Header />
              {children}
              <Footer />
            </App>
          </Providers>
        </body>
      </html>
    </ConfigProvider>
  );
}
