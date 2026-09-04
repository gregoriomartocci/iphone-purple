import {
  BadgeCheck,
  Banknote,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { fichaTecnica } from "@/lib/data/ficha-tecnica";
import type { Product, Variant } from "@/types";
import { GRADE_LABELS, GRADE_SPECS } from "@/types";

/**
 * Ficha técnica completa del equipo.
 *
 * Va abajo del bloque de compra y no adentro: quien ya decidió no la necesita,
 * y quien está comparando quiere leerla entera sin que el precio le siga
 * saltando al lado. Se muestra desplegada —no en pestañas— porque el objetivo
 * es justamente que se pueda recorrer de una.
 */
export function FichaTecnica({
  product,
  variante,
}: {
  product: Product;
  /** La variante elegida: capacidad, color y batería salen de acá. */
  variante?: Variant;
}) {
  const secciones = fichaTecnica(product);

  // Lo de esta unidad concreta, que no está en la ficha del modelo.
  const deEstaUnidad: [string, string][] = [];
  if (variante) {
    deEstaUnidad.push(["Capacidad", variante.storage]);
    deEstaUnidad.push(["Color", variante.color]);
    deEstaUnidad.push(["Condición", GRADE_LABELS[variante.grade]]);
    deEstaUnidad.push(["Estado cosmético", GRADE_SPECS[variante.grade].cosmetic]);
    if (variante.batteryHealth !== null) {
      deEstaUnidad.push(["Salud de batería", `${variante.batteryHealth} %`]);
    }
    if (variante.authenticity === "replica") {
      deEstaUnidad.push(["Autenticidad", "Réplica — no es un producto original"]);
    }
  }

  const todas = deEstaUnidad.length
    ? [{ titulo: "Esta unidad", datos: deEstaUnidad }, ...secciones]
    : secciones;

  if (todas.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-20">
      <h2 className="text-2xl font-semibold sm:text-3xl">Ficha técnica</h2>
      <p className="text-muted-foreground prosa mt-2">
        Todo lo que trae el equipo, para que puedas compararlo sin salir de acá.
      </p>

      {/* Dos columnas en escritorio: la ficha de un iPhone son cinco bloques y
          en una sola columna obliga a scrollear de más para verla completa. */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {todas.map((seccion) => (
          <div
            key={seccion.titulo}
            className="border-line bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <h3 className="border-line bg-elevated text-foreground border-b px-5 py-3.5 text-sm font-semibold">
              {seccion.titulo}
            </h3>
            <dl className="divide-line divide-y">
              {seccion.datos.map(([campo, valor]) => (
                <div
                  key={campo}
                  className="flex flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:gap-4"
                >
                  <dt className="text-muted-foreground sm:w-44 sm:shrink-0">{campo}</dt>
                  <dd className="text-foreground">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

const RESPALDOS = [
  {
    icon: ShieldCheck,
    titulo: "Garantía escrita de 6 meses",
    texto:
      "Con factura. Si el equipo falla dentro del plazo lo resolvemos nosotros, sin intermediarios.",
  },
  {
    icon: BadgeCheck,
    titulo: "Revisado antes de publicarlo",
    texto:
      "Chequeamos batería, piezas originales y que no tenga bloqueo de iCloud ni deuda de IMEI.",
  },
  {
    icon: Wrench,
    titulo: "Servicio técnico propio",
    texto: "No dependemos de terceros para reparar lo que vendemos.",
  },
  {
    icon: RotateCcw,
    titulo: "Plan Canje",
    texto: "Entregás tu equipo usado como parte de pago y pagás solo la diferencia.",
  },
  {
    icon: Truck,
    titulo: "Retiro o envío",
    texto: "Retirás en el local de La Plata o te lo enviamos a todo el país.",
  },
  {
    icon: Banknote,
    titulo: "Efectivo, transferencia o tarjeta",
    texto: "El precio publicado es el final: coordinamos la forma de pago al cerrar.",
  },
];

/**
 * Respaldos del negocio.
 *
 * Es lo que responde la duda de fondo de comprar un usado por internet: qué
 * pasa si falla, quién lo revisó, cómo se paga. Van los seis juntos y no
 * salpicados por la página, porque la pregunta aparece toda junta.
 */
export function Respaldos() {
  return (
    <section className="mt-16 sm:mt-20">
      <h2 className="text-2xl font-semibold sm:text-3xl">Con qué respaldo comprás</h2>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {RESPALDOS.map(({ icon: Icon, titulo, texto }) => (
          <div
            key={titulo}
            className="border-line bg-surface rounded-2xl border p-5 shadow-sm"
          >
            <span className="border-line bg-elevated text-foreground flex size-10 items-center justify-center rounded-xl border">
              <Icon className="size-[18px]" />
            </span>
            <h3 className="text-foreground mt-4 font-medium">{titulo}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              {texto}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
