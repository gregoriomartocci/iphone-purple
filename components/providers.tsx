"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { CuentaProvider } from "@/components/cuenta/CuentaProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CuentaProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <Toaster position="bottom-right" />
        </CartProvider>
      </CuentaProvider>
    </SessionProvider>
  );
}
