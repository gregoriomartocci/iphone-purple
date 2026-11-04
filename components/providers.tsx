"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { CuentaProvider } from "@/components/cuenta/CuentaProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CuentaProvider>
        {children}
        <Toaster position="bottom-right" />
      </CuentaProvider>
    </SessionProvider>
  );
}
