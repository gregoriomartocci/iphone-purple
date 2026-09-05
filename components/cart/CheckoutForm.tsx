"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { Calendario } from "./Calendario";
import { confirmarPedido } from "@/app/(store)/checkout/actions";
import { fechaLarga } from "@/lib/turnos";
import { useCart } from "./CartProvider";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { formatARS } from "@/utils/format";
import { Precio } from "@/components/site/Precio";
import { cn } from "@/lib/utils";

const ENTREGAS = [
  {
    value: "retiro",
    label: "Retiro en el local",
    detalle: "Sin costo, coordinamos el día",
  },
  {
    value: "envio",
    label: "Envío a domicilio",
    detalle: "Pagás online y te lo mandamos",
  },
] as const;

/**
 * Confirmación de pedido sin cuenta.
 *
 * Comprar no puede exigir registrarse: el pedido se arma con nombre y
 * teléfono, y la cuenta queda como algo opcional para después, si la persona
 * quiere seguir sus compras o guardar favoritos.
 */
export function CheckoutForm({
  whatsappNumber,
  pagoDisponible,
}: {
  whatsappNumber: string;
  /** Si la pasarela está configurada. Si no, el envío se cierra por WhatsApp. */
  pagoDisponible: boolean;
}) {
  const { items, total, count } = useCart();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [entrega, setEntrega] = useState<(typeof ENTREGAS)[number]["value"]>("retiro");
  const [direccion, setDireccion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [tocadoEmail, setTocadoEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [enviando, startTransition] = useTransition();

  /**
   * Validación de correo.
   *
   * Alcanza para atajar lo que de verdad pasa —el punto que falta, el espacio
   * pegado, el dominio sin punto— y no pretende decidir si la casilla existe:
   * eso solo lo sabe un mail de verificación. El servidor vuelve a validar,
   * así que esto es para dar buen feedback, no para confiar.
   */
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

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
    entrega === "retiro" && fecha && hora
      ? `Turno: ${fechaLarga(fecha)} a las ${hora}`
      : null,
    entrega === "envio" && direccion.trim() ? `Dirección: ${direccion.trim()}` : null,
    email.trim() ? `Correo: ${email.trim()}` : null,
    nombre.trim() ? `Nombre: ${nombre.trim()}` : null,
    telefono.trim() ? `Teléfono: ${telefono.trim()}` : null,
    notas.trim() ? `Notas: ${notas.trim()}` : null,
  ]
    .filter((linea): linea is string => linea !== null)
    .join("\n");

  /** Qué falta para poder confirmar, según el camino elegido. */
  const listo =
    nombre.trim().length >= 2 &&
    telefono.trim().length >= 6 &&
    emailValido &&
    (entrega === "envio" ? direccion.trim().length >= 8 : Boolean(fecha && hora));

  const confirmar = () => {
    setError(null);
    startTransition(async () => {
      const r = await confirmarPedido({
        items: items.map((i) => ({
          nombre: i.name,
          variante: i.variantLabel,
          cantidad: i.quantity,
          precioArs: i.priceArs,
        })),
        nombre,
        email,
        telefono,
        entrega,
        direccion: direccion || undefined,
        fecha: fecha || undefined,
        hora: hora || undefined,
        notas: notas || undefined,
      });

      if (!r.ok) return setError(r.error);
      // Con pasarela configurada se sale del sitio a completar el pago.
      if (r.modo === "pagar") window.location.href = r.url;
      else setReferencia(r.referencia);
    });
  };

  const fieldClass =
    "h-13 w-full rounded-xl border border-line bg-surface px-4 text-base text-foreground shadow-sm outline-none transition-colors focus-visible:border-ink";

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

            <label className="block sm:col-span-2">
              <span className="text-muted-foreground mb-1.5 block text-sm">Correo</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTocadoEmail(true)}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Para mandarte el comprobante"
                aria-invalid={tocadoEmail && email.length > 0 && !emailValido}
                className={cn(
                  fieldClass,
                  tocadoEmail && email.length > 0 && !emailValido && "border-destructive"
                )}
              />
              {/* El aviso aparece recién al salir del campo: marcar en rojo
                  mientras alguien todavía está escribiendo su mail molesta. */}
              {tocadoEmail && email.length > 0 && !emailValido && (
                <span className="text-destructive mt-1.5 flex items-center gap-1.5 text-sm">
                  <AlertCircle className="size-3.5" />
                  Revisá el correo, no parece válido.
                </span>
              )}
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
                    ? "border-ink ring-ink/20 ring-2"
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

        {/* Lo que se pide cambia según cómo lo recibe: una dirección para el
            envío, un turno para el retiro. Pedir las dos cosas siempre obliga
            a completar campos que no van a usarse. */}
        {entrega === "envio" ? (
          <section className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold">¿A dónde te lo mandamos?</h2>
            <label className="mt-4 block">
              <span className="text-muted-foreground mb-1.5 block text-sm">
                Dirección completa
              </span>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                autoComplete="street-address"
                placeholder="Calle, número, piso, localidad y código postal"
                className={fieldClass}
              />
            </label>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {pagoDisponible
                ? "Al confirmar te llevamos a Mercado Pago para completar el pago. El envío se coordina apenas se acredita."
                : "Te escribimos para cotizar el envío según la zona y coordinar el pago."}
            </p>
          </section>
        ) : (
          <section className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Agendá tu retiro</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Reservá el día y la hora que mejor te quede. Pagás en el local al retirarlo.
            </p>
            <div className="mt-5">
              <Calendario fecha={fecha} hora={hora} onFecha={setFecha} onHora={setHora} />
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold">
            Notas <span className="text-muted-foreground font-normal">(opcional)</span>
          </h2>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Dirección, horario preferido, cualquier cosa que nos sirva."
            className="border-line bg-surface text-foreground focus-visible:border-ink mt-4 w-full resize-y rounded-xl border p-4 text-base shadow-sm transition-colors outline-none"
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
                <Precio
                  ars={item.priceArs * item.quantity}
                  usd={item.priceUsd * item.quantity}
                  anclado
                  fuerte="0.875rem"
                  suave="0.6875rem"
                  className="shrink-0 items-end"
                />
              </li>
            ))}
          </ul>

          {/*
            Acá los pesos no se mueven aunque el sitio esté en dólares.

            No es una referencia: es el importe que Mercado Pago va a cobrar.
            Mostrar dólares grandes sería anunciar un pago en una moneda en la
            que nadie va a pagar.
          */}
          <div className="border-line mt-4 flex items-end justify-between border-t pt-4">
            <span className="text-muted-foreground">Total</span>
            <Precio
              ars={total}
              usd={items.reduce((n, i) => n + i.priceUsd * i.quantity, 0)}
              anclado
              fuerte="1.5rem"
              suave="0.8125rem"
              className="items-end"
            />
          </div>

          {referencia ? (
            // Pedido tomado: se muestra la referencia y se ofrece seguir por
            // WhatsApp, que es donde el local realmente responde.
            <div className="border-line bg-elevated mt-5 rounded-xl border p-4">
              <p className="text-foreground flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Pedido {referencia}
              </p>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {entrega === "retiro"
                  ? `Te esperamos el ${fechaLarga(fecha)} a las ${hora}. Te lo confirmamos por WhatsApp.`
                  : "Te escribimos para cerrar el envío y el pago."}
              </p>
              <WhatsAppLink
                number={whatsappNumber}
                message={mensaje}
                className="mt-4 w-full"
              >
                Seguir por WhatsApp
              </WhatsAppLink>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={!listo || enviando}
                onClick={confirmar}
                className="bg-ink hover:bg-ink/85 mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors disabled:opacity-50"
              >
                {enviando ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : entrega === "envio" && pagoDisponible ? (
                  "Ir a pagar"
                ) : entrega === "retiro" ? (
                  "Reservar el turno"
                ) : (
                  "Confirmar pedido"
                )}
              </button>

              {error && (
                <p className="text-destructive mt-3 flex items-start gap-1.5 text-sm">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <p className="text-muted-foreground mt-3 text-center text-sm leading-relaxed">
                {entrega === "envio" && pagoDisponible
                  ? "Te llevamos a Mercado Pago para completar el pago de forma segura."
                  : entrega === "retiro"
                    ? "Reservás el turno ahora y pagás en el local al retirarlo."
                    : "Te confirmamos stock y coordinamos el pago por WhatsApp."}
              </p>

              <WhatsAppLink
                number={whatsappNumber}
                message={mensaje}
                variant="outline"
                className="mt-3 w-full"
              >
                Prefiero escribir directo
              </WhatsAppLink>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
