"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CartDrawer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#12121A",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          },
        }}
      />
    </SessionProvider>
  );
}
