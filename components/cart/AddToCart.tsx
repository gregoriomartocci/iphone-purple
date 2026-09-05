"use client";

import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { GRADE_LABELS, type Product, type Variant } from "@/types";
import { cn } from "@/lib/utils";

/** Botón de agregar al carrito para la ficha de producto. */
export function AddToCart({
  product,
  variant,
  className,
}: {
  product: Product;
  variant: Variant | undefined;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  if (!variant || variant.stock === 0) return null;

  return (
    <button
      type="button"
      onClick={() => {
        add({
          variantId: variant.id,
          slug: product.slug,
          name: product.name,
          variantLabel: `${variant.storage} · ${variant.color} · ${GRADE_LABELS[variant.grade]}`,
          priceArs: variant.priceArs,
          priceUsd: variant.priceUsd,
          image: product.images[0]?.url ?? null,
          maxStock: variant.stock,
        });
        // Confirmación breve en el propio botón: el panel ya se abre solo,
        // pero el botón que se tocó también tiene que responder.
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      className={cn(
        "inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-medium text-white transition-colors",
        // Al confirmar rebota y muestra el tilde. El color no cambia: el
        // violeta es de la marca —logo y carrito— y no del contenido.
        added ? "bg-ink pop" : "bg-ink hover:bg-ink/85",
        className
      )}
    >
      {added ? (
        <>
          <Check className="size-4" />
          Agregado
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" />
          Agregar al carrito
        </>
      )}
    </button>
  );
}
