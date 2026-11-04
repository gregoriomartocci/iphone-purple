import { describe, expect, it } from "vitest";
import { armarMercado, type ListaDeProveedor } from "@/lib/whatsapp/mercado";
import { armarRanking, ordenarRanking } from "@/lib/whatsapp/ranking";
import type { ParsedRow, Supplier } from "@/types";

const AHORA = new Date("2026-11-04T12:00:00Z");

function fila(model: string, cost: number): ParsedRow {
  return {
    brand: "Apple",
    model,
    category: "celular",
    authenticity: "original",
    storage: "128GB",
    color: null,
    grade: "sellado",
    batteryHealth: null,
    currency: "USD",
    cost,
    quantity: 1,
    notes: null,
  } as ParsedRow;
}

function proveedor(id: string): Supplier {
  return { id, name: id, phone: null, defaultMarginPct: 5, isActive: true };
}

function lista(id: string, filas: ParsedRow[]): ListaDeProveedor {
  return { proveedor: proveedor(id), fecha: "2026-11-04T10:00:00Z", filas };
}

const mercado = armarMercado(
  [
    lista("barato", [fila("iPhone 16", 800)]),
    lista("caro", [
      fila("iPhone 16", 880),
      fila("iPhone 15", 600),
      fila("iPhone 14", 500),
    ]),
    lista("solo", [fila("iPad", 400)]),
  ],
  1500
);
const proveedores = ["barato", "caro", "solo", "nuevo"].map(proveedor);
const fechas = new Map([
  ["barato", ["2026-11-04T10:00:00Z"]],
  [
    "caro",
    [
      "2026-11-01T10:00:00Z",
      "2026-11-03T10:00:00Z",
      "2026-11-03T18:00:00Z",
      "2026-01-01T10:00:00Z",
    ],
  ],
  ["solo", ["2026-11-02T10:00:00Z"]],
]);
const filas = armarRanking(proveedores, mercado, fechas, AHORA);
const orden = (c: Parameters<typeof ordenarRanking>[1]) =>
  ordenarRanking(filas, c).map((f) => f.proveedor.id);

describe("armarRanking", () => {
  it("mide el sobreprecio solo en equipos compartidos", () => {
    const caro = filas.find((f) => f.proveedor.id === "caro")!;
    expect(caro.compartidos).toBe(1);
    expect(caro.masBaratoEn).toBe(0);
    expect(caro.sobreprecioPct).toBeCloseTo(10);
    expect(filas.find((f) => f.proveedor.id === "solo")!.sobreprecioPct).toBeNull();
  });

  it("cuenta días distintos dentro de los últimos 30", () => {
    expect(filas.find((f) => f.proveedor.id === "caro")!.diasConLista).toBe(2);
  });

  it("no cuenta a un proveedor inactivo", () => {
    const r = armarRanking(
      [{ ...proveedor("x"), isActive: false }],
      mercado,
      fechas,
      AHORA
    );
    expect(r).toEqual([]);
  });
});

describe("ordenarRanking", () => {
  it("ordena por cada criterio y deja al final lo que no tiene dato", () => {
    expect(orden("precio").slice(0, 2)).toEqual(["barato", "caro"]);
    expect(orden("variedad")[0]).toBe("caro");
    expect(orden("reciente")[0]).toBe("barato");
    expect(orden("frecuencia")[0]).toBe("caro");
    for (const c of ["variedad", "reciente", "frecuencia"] as const) {
      expect(orden(c).at(-1)).toBe("nuevo");
    }
  });
});
