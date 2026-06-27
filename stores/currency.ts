import { create } from "zustand";
import { persist } from "zustand/middleware";

type Currency = "ARS" | "USD";

interface CurrencyStore {
  currency: Currency;
  usdRate: number;
  setCurrency: (c: Currency) => void;
  setUsdRate: (rate: number) => void;
  format: (amountARS: number) => string;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "ARS",
      usdRate: 1000,

      setCurrency: (currency) => set({ currency }),
      setUsdRate: (usdRate) => set({ usdRate }),

      format: (amountARS) => {
        const { currency, usdRate } = get();
        if (currency === "USD") {
          const usd = amountARS / usdRate;
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
          }).format(usd);
        }
        return new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 0,
        }).format(amountARS);
      },
    }),
    {
      name: "ipp-currency",
    }
  )
);
