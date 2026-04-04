import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { App, ConfigProvider } from "antd";
import { Providers } from "@/components/providers";
import type { ReactNode } from "react";

const titleFont = Jost({
  variable: "--font-notoserif-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "ФОМИН ГРУМИНГ ИНФО",
  description:
    "Информационный портал для грумеров. События, бренды и знания в одном месте",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
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
            <App>{children}</App>
          </Providers>
        </body>
      </html>
    </ConfigProvider>
  );
}
