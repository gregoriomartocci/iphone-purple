"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Una línea del carrito. Se guarda todo lo necesario para mostrarla sin
 *  volver a pedir el producto: si el catálogo cambia, el carrito sigue siendo
 *  legible y el precio queda congelado al momento de agregarlo. */
export type CartItem = {
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  priceArs: number;
  /** El mismo precio en dólares, para poder mostrarlo en las dos monedas. */
  priceUsd: number;
  image: string | null;
  /** Stock disponible al agregarlo, para no dejar sumar de más. */
  maxStock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ip-cart-v1";

/**
 * Carrito del sitio.
 *
 * Vive en el navegador y se persiste en localStorage: no hace falta cuenta
 * para comprar, así que no hay dónde guardarlo del lado del servidor hasta
 * que la persona confirma el pedido.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /**
   * Se lee después del primer render: en el servidor no hay localStorage, y
   * leerlo durante el render daría marcado distinto en cliente y servidor.
   *
   * La regla de renders en cascada no aplica: esto corre una sola vez al
   * montar para rehidratar un estado externo, no en respuesta a props que
   * cambian, así que no puede encadenarse.
   */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ver arriba
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Modo privado o storage bloqueado: se arranca con el carrito vacío.
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Si no se puede persistir, el carrito igual funciona en esta sesión.
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.variantId === item.variantId);
      if (!existing) return [...current, { ...item, quantity }];
      // Nunca por encima del stock: prometer lo que no hay se paga después.
      return current.map((i) =>
        i.variantId === item.variantId
          ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
          : i
      );
    });
    setOpen(true);
  }, []);

  const remove = useCallback((variantId: string) => {
    setItems((current) => current.filter((i) => i.variantId !== variantId));
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.variantId !== variantId)
        : current.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.maxStock) }
              : i
          )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.priceArs * i.quantity, 0);
    return { items, count, total, add, remove, setQuantity, clear, open, setOpen };
  }, [items, add, remove, setQuantity, clear, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
