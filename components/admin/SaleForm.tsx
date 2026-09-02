"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { registerSaleAction } from "@/app/admin/actions";
import { formatARS } from "@/utils/format";
import { GRADE_LABELS, type Product } from "@/types";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "canje", label: "Parte de pago / canje" },
] as const;

type Payment = (typeof PAYMENT_METHODS)[number]["value"];

/**
 * Alta de venta.
 *
 * Elegir la variante autocompleta precio y costo, pero el precio queda editable:
 * en el mostrador se negocia, y la venta tiene que reflejar lo que pasó de verdad,
 * no lo que decía la lista.
 */
export function SaleForm({
  products,
  dollarRate,
  supabaseReady,
}: {
  products: Product[];
  dollarRate: number;
  supabaseReady: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [variantId, setVariantId] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [payment, setPayment] = useState<Payment>("efectivo");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const options = products.flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.id,
      productName: product.name,
      label: `${product.name} · ${variant.storage} · ${variant.color} · ${GRADE_LABELS[variant.grade]}`,
      variantLabel: `${variant.storage} · ${variant.color} · ${GRADE_LABELS[variant.grade]}`,
      priceArs: variant.priceArs,
      costArs: variant.costUsd === null ? null : Math.round(variant.costUsd * dollarRate),
      stock: variant.stock,
    }))
  );

  const selected = options.find((o) => o.id === variantId);

  function reset() {
    setVariantId("");
    setSalePrice(0);
    setQuantity(1);
    setCustomerName("");
    setCustomerPhone("");
    setPayment("efectivo");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      toast.error("Elegí el equipo vendido.");
      return;
    }

    startTransition(async () => {
      const result = await registerSaleAction({
        variantId: selected.id,
        productName: selected.productName,
        variantLabel: selected.variantLabel,
        salePrice,
        costPrice: selected.costArs,
        quantity,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        paymentMethod: payment,
        notes: notes.trim() || null,
      });

      if (result.ok) {
        toast.success("Venta registrada. El stock ya quedó descontado.");
        reset();
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  const fieldClass =
    "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-purple";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-ink hover:bg-ink/85 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium text-white transition-colors"
      >
        <Plus className="size-4" />
        Registrar venta
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-line rounded-xl border p-5">
      <h2 className="font-medium">Registrar venta</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-muted-foreground mb-1.5 block text-xs">
            Equipo vendido
          </span>
          <select
            value={variantId}
            onChange={(e) => {
              setVariantId(e.target.value);
              const option = options.find((o) => o.id === e.target.value);
              if (option) setSalePrice(option.priceArs);
            }}
            required
            className={fieldClass}
          >
            <option value="">Elegí un equipo…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id} disabled={o.stock === 0}>
                {o.label} — {formatARS(o.priceArs)}
                {o.stock === 0 ? " (sin stock)" : ` (${o.stock} disp.)`}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs">
            Precio de venta (ARS)
          </span>
          <input
            type="number"
            min={0}
            step={1000}
            value={salePrice}
            onChange={(e) => setSalePrice(Number(e.target.value))}
            required
            className={cn(fieldClass, "tnum")}
          />
          {selected?.costArs !== null && selected !== undefined && (
            <span className="text-muted-foreground mt-1 block text-xs">
              Costo {formatARS(selected.costArs ?? 0)} · margen{" "}
              {formatARS(salePrice - (selected.costArs ?? 0))}
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs">Cantidad</span>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            className={cn(fieldClass, "tnum")}
          />
        </label>

        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs">Cliente</span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nombre y apellido"
            required
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs">
            Teléfono <span className="text-muted-foreground">(opcional)</span>
          </span>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            type="tel"
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs">
            Forma de pago
          </span>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value as Payment)}
            className={fieldClass}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-muted-foreground mb-1.5 block text-xs">
            Notas <span className="text-muted-foreground">(opcional)</span>
          </span>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Entregó un iPhone 12 en parte de pago…"
            className={fieldClass}
          />
        </label>
      </div>

      {!supabaseReady && (
        <p className="mt-4 text-sm text-amber-700">
          Conectá Supabase para poder registrar ventas.
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={pending || !supabaseReady}
          className="bg-ink hover:bg-ink/85 inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Guardar venta
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="border-line text-foreground hover:border-foreground/35 inline-flex h-10 items-center rounded-full border px-5 text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
