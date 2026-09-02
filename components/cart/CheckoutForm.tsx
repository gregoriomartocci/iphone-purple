"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { formatARS } from "@/utils/format";
import { cn } from "@/lib/utils";

const ENTREGAS = [
  {
    value: "retiro",
    label: "Retiro en el local",
    detalle: "Sin costo, coordinamos el día",
  },
  { value: "envio", label: "Envío a domicilio", detalle: "Se cotiza según la zona" },
] as const;

/**
 * Confirmación de pedido sin cuenta.
 *
 * Comprar no puede exigir registrarse: el pedido se arma con nombre y
 * teléfono, y la cuenta queda como algo opcional para después, si la persona
 * quiere seguir sus compras o guardar favoritos.
 */
export function CheckoutForm({ whatsappNumber }: { whatsappNumber: string }) {
  const { items, total, count } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [entrega, setEntrega] = useState<(typeof ENTREGAS)[number]["value"]>("retiro");
  const [notas, setNotas] = useState("");

  if (items.length === 0) {
    return (
      <div className="border-line bg-surface rounded-2xl border py-20 text-center shadow-sm">
        <span className="border-line mx-auto flex size-16 items-center justify-center rounded-2xl border">
          <ShoppingBag className="text-muted-foreground size-7" />
        </span>
        <p className="text-foreground mt-5 text-lg font-medium">Tu carrito está vacío</p>
        <p className="text-muted-foreground mt-2">
          Agregá algún equipo del catálogo para poder confirmar el pedido.
        </p>
        <Link
          href="/catalogo"
          className="bg-ink hover:bg-ink/85 mt-6 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-medium text-white transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const mensaje = [
    `¡Hola! Quiero confirmar este pedido:`,
    "",
    ...items.map(
      (i) =>
        `• ${i.quantity}× ${i.name} — ${i.variantLabel} — ${formatARS(i.priceArs * i.quantity)}`
    ),
    "",
    `Total: ${formatARS(total)}`,
    `Entrega: ${ENTREGAS.find((e) => e.value === entrega)!.label}`,
    nombre.trim() ? `Nombre: ${nombre.trim()}` : null,
    telefono.trim() ? `Teléfono: ${telefono.trim()}` : null,
    notas.trim() ? `Notas: ${notas.trim()}` : null,
  ]
    .filter((linea): linea is string => linea !== null)
    .join("\n");

  const fieldClass =
    "h-13 w-full rounded-xl border border-line bg-surface px-4 text-base text-foreground shadow-sm outline-none transition-colors focus-visible:border-purple";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold">Tus datos</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-sm">Nombre</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                placeholder="Cómo te llamás"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-sm">Teléfono</span>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                type="tel"
                autoComplete="tel"
                placeholder="Para coordinar la entrega"
                className={fieldClass}
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Cómo lo recibís</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ENTREGAS.map((opcion) => (
              <button
                key={opcion.value}
                type="button"
                onClick={() => setEntrega(opcion.value)}
                className={cn(
                  "bg-surface rounded-2xl border p-5 text-left shadow-sm transition-all duration-200",
                  entrega === opcion.value
                    ? "border-purple ring-purple/20 ring-2"
                    : "border-line hover:border-foreground/30"
                )}
              >
                <span className="text-foreground block font-semibold">
                  {opcion.label}
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  {opcion.detalle}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">
            Notas <span className="text-muted-foreground font-normal">(opcional)</span>
          </h2>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Dirección, horario preferido, cualquier cosa que nos sirva."
            className="border-line bg-surface text-foreground focus-visible:border-purple mt-4 w-full resize-y rounded-xl border p-4 text-base shadow-sm transition-colors outline-none"
          />
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Tu pedido ({count})</h2>

          <ul className="divide-line mt-4 divide-y">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3 py-3">
                <span className="bg-elevated relative size-14 shrink-0 overflow-hidden rounded-lg">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block truncate text-sm font-medium">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {item.variantLabel}
                  </span>
                </span>
                <span className="tnum shrink-0 text-sm font-semibold">
                  {formatARS(item.priceArs * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-line mt-4 flex items-baseline justify-between border-t pt-4">
            <span className="text-muted-foreground">Total</span>
            <span className="tnum text-2xl font-semibold">{formatARS(total)}</span>
          </div>

          <WhatsAppLink number={whatsappNumber} message={mensaje} className="mt-5 w-full">
            Confirmar pedido
          </WhatsAppLink>

          <p className="text-muted-foreground mt-3 text-center text-sm leading-relaxed">
            Se abre WhatsApp con el pedido listo. Te confirmamos stock y coordinamos el
            pago, que podés hacer en el local o por transferencia.
          </p>
        </div>
      </aside>
    </div>
  );
}
