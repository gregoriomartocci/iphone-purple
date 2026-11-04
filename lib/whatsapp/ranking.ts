import type { Supplier } from "@/types";
import type { EquipoMercado } from "./mercado";

export type CriterioRanking = "precio" | "variedad" | "reciente" | "frecuencia";

export interface FilaRanking {
  proveedor: Supplier;
  /** Equipos de su última lista. */
  equipos: number;
  /** Equipos que también ofrece otro proveedor: los únicos que se pueden comparar. */
  compartidos: number;
  /** De esos, en cuántos es el más barato. */
  masBaratoEn: number;
  /** Cuánto más caro que el mejor precio, en promedio. `null` si no compite con nadie. */
  sobreprecioPct: number | null;
  ultimaLista: string | null;
  /** Días distintos con una lista en los últimos 30. */
  diasConLista: number;
}

const DIA_MS = 86_400_000;
const VENTANA_DIAS = 30;

/** Fechas de lista por proveedor: importaciones y lo que está viendo el lector. */
export function armarRanking(
  proveedores: Supplier[],
  mercado: EquipoMercado[],
  fechasDeLista: ReadonlyMap<string, string[]>,
  ahora: Date
): FilaRanking[] {
  const desde = ahora.getTime() - VENTANA_DIAS * DIA_MS;

  return proveedores
    .filter((p) => p.isActive)
    .map((proveedor) => {
      const propios = mercado.flatMap((equipo) => {
        const oferta = equipo.ofertas.find((o) => o.proveedorId === proveedor.id);
        return oferta ? [{ equipo, oferta }] : [];
      });
      const compartidos = propios.filter((p) => p.equipo.ofertas.length > 1);
      const fechas = fechasDeLista.get(proveedor.id) ?? [];

      return {
        proveedor,
        equipos: propios.length,
        compartidos: compartidos.length,
        masBaratoEn: compartidos.filter(
          (p) => p.oferta.costoUsd === p.equipo.ofertas[0].costoUsd
        ).length,
        sobreprecioPct:
          compartidos.length === 0
            ? null
            : compartidos.reduce(
                (suma, p) =>
                  suma + (p.oferta.costoUsd / p.equipo.ofertas[0].costoUsd - 1) * 100,
                0
              ) / compartidos.length,
        ultimaLista: fechas.reduce<string | null>(
          (ultima, f) => (!ultima || f > ultima ? f : ultima),
          null
        ),
        diasConLista: new Set(
          fechas.filter((f) => new Date(f).getTime() >= desde).map((f) => f.slice(0, 10))
        ).size,
      };
    });
}

/** Lo que no tiene dato va siempre al final: no saber no es ser el peor ni el mejor. */
function porNumero(a: number | null, b: number | null, sentido: 1 | -1): number {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return (a - b) * sentido;
}

export function ordenarRanking(
  filas: FilaRanking[],
  criterio: CriterioRanking
): FilaRanking[] {
  const tiempo = (f: FilaRanking) =>
    f.ultimaLista ? new Date(f.ultimaLista).getTime() : null;
  const conLista = (n: number, f: FilaRanking) =>
    f.equipos === 0 && !f.ultimaLista ? null : n;

  return [...filas].sort((a, b) => {
    switch (criterio) {
      case "precio":
        return (
          porNumero(a.sobreprecioPct, b.sobreprecioPct, 1) ||
          b.compartidos - a.compartidos ||
          b.equipos - a.equipos
        );
      case "variedad":
        return porNumero(conLista(a.equipos, a), conLista(b.equipos, b), -1);
      case "reciente":
        return porNumero(tiempo(a), tiempo(b), -1);
      case "frecuencia":
        return porNumero(conLista(a.diasConLista, a), conLista(b.diasConLista, b), -1);
    }
  });
}
