"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatARS } from "@/utils/format";

/**
 * Panel lateral del carrito.
 *
 * Se abre solo al agregar algo: confirma la acción sin sacar a la persona del
 * catálogo, que es donde suele querer seguir mirando.
 */
export function CartDrawer() {
  const { items, count, total, remove, setQuantity, open, setOpen } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-label="Carrito"
        className="bg-background absolute inset-y-0 right-0 flex w-full max-w-md flex-col shadow-2xl"
      >
        <header className="border-line flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="size-5" />
            Tu carrito
            {count > 0 && (
              <span className="text-muted-foreground text-sm font-normal">({count})</span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar carrito"
            className="text-muted-foreground hover:text-foreground hover:bg-elevated rounded-lg p-2 transition-colors"
          >
            <X className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="border-line bg-surface flex size-16 items-center justify-center rounded-2xl border">
              <ShoppingBag className="text-muted-foreground size-7" />
            </span>
            <p className="text-foreground mt-5 text-lg font-medium">
              Todavía no agregaste nada
            </p>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Mirá el catálogo y sumá los equipos que te interesen.
            </p>
            <Link
              href="/catalogo"
              onClick={() => setOpen(false)}
              className="bg-ink hover:bg-ink/85 mt-6 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-medium text-white transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-line flex-1 divide-y overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-4">
                  <Link
                    href={`/catalogo/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="bg-elevated relative size-20 shrink-0 overflow-hidden rounded-xl"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/catalogo/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-foreground hover:text-purple block font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {item.variantLabel}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="border-line flex items-center rounded-lg border">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Quitar uno"
                          className="text-muted-foreground hover:text-foreground p-1.5 transition-colors"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="tnum w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          aria-label="Agregar uno"
                          className="text-muted-foreground hover:text-foreground p-1.5 transition-colors disabled:opacity-40"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <span className="tnum text-foreground font-semibold">
                        {formatARS(item.priceArs * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.variantId)}
                    aria-label={`Quitar ${item.name}`}
                    className="text-muted-foreground hover:text-destructive h-fit p-1 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-line bg-surface border-t p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="tnum text-2xl font-semibold">{formatARS(total)}</span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                El envío se coordina al confirmar el pedido.
              </p>

              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="bg-ink hover:bg-ink/85 mt-4 flex h-13 w-full items-center justify-center rounded-full text-[15px] font-medium text-white transition-colors"
              >
                Finalizar compra
              </Link>
              <p className="text-muted-foreground mt-3 text-center text-sm">
                No hace falta crear una cuenta.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
