import { Footer as AntFooter } from "antd/es/layout/layout";
import { Copyright } from "./copyright";

export function Footer() {
  return (
    <AntFooter
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="container mx-auto flex items-center justify-center p-7.5">
        <Copyright />
      </div>
    </AntFooter>
  );
}
