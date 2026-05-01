"use client";

import { SessionProvider } from "next-auth/react";
import { IsMobileProvider } from "./is-mobile-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <IsMobileProvider>{children}</IsMobileProvider>
    </SessionProvider>
  );
}
