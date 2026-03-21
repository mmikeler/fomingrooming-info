import { Footer } from "../components/footer";
import { Header } from "./components/header";

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="m-auto max-w-360 bg-white lg:rounded-xl">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
