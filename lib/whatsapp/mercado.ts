import type { ParsedRow, Supplier } from "@/types";
import { sellPrice } from "./parser";
import { claveEquipo } from "./sincronizar";

export interface OfertaMercado {
  proveedorId: string;
  proveedor: string;
  telefono: string | null;
  costo: number;
  moneda: "USD" | "ARS";
  costoUsd: number;
  fecha: string;
}

export interface EquipoMercado {
  clave: string;
  modelo: string;
  capacidad: string;
  grado: ParsedRow["grade"];
  autenticidad: ParsedRow["authenticity"];
  categoria: ParsedRow["category"];
  /** De más barata a más cara. */
  ofertas: OfertaMercado[];
  precioUsd: number;
  precioArs: number;
}

export interface ListaDeProveedor {
  proveedor: Supplier;
  fecha: string;
  filas: ParsedRow[];
}

/** Agrupa la última lista de cada proveedor por equipo, con el mismo criterio que el plan. */
export function armarMercado(listas: ListaDeProveedor[], dolar: number): EquipoMercado[] {
  const porClave = new Map<string, Omit<EquipoMercado, "precioUsd" | "precioArs">>();

  for (const { proveedor, fecha, filas } of listas) {
    for (const fila of filas) {
      const clave = claveEquipo(fila);
      let equipo = porClave.get(clave);
      if (!equipo) {
        equipo = {
          clave,
          modelo: fila.model,
          capacidad: fila.storage,
          grado: fila.grade,
          autenticidad: fila.authenticity,
          categoria: fila.category,
          ofertas: [],
        };
        porClave.set(clave, equipo);
      }
      equipo.ofertas.push({
        proveedorId: proveedor.id,
        proveedor: proveedor.name,
        telefono: proveedor.phone,
        costo: fila.cost,
        moneda: fila.currency,
        costoUsd: fila.currency === "USD" ? fila.cost : fila.cost / dolar,
        fecha,
      });
    }
  }

  const margenes = new Map(
    listas.map((l) => [l.proveedor.id, l.proveedor.defaultMarginPct])
  );

  return [...porClave.values()]
    .map((equipo) => {
      const ofertas = [...equipo.ofertas].sort((a, b) => a.costoUsd - b.costoUsd);
      const mejor = ofertas[0];
      const precio = sellPrice(
        mejor.costo,
        mejor.moneda,
        margenes.get(mejor.proveedorId) ?? 0,
        dolar
      );
      return {
        ...equipo,
        ofertas,
        precioUsd: precio.priceUsd,
        precioArs: precio.priceArs,
      };
    })
    .sort(
      (a, b) =>
        a.modelo.localeCompare(b.modelo, "es") ||
        a.ofertas[0].costoUsd - b.ofertas[0].costoUsd
    );
}
