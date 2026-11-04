import { describe, expect, it } from "vitest";
import { esTelefonoReal, mensajeDeStock } from "@/lib/whatsapp/consulta-stock";
import { armarMercado, type ListaDeProveedor } from "@/lib/whatsapp/mercado";
import type { ParsedRow, Supplier } from "@/types";

function fila(p: Partial<ParsedRow> = {}): ParsedRow {
  return {
    brand: "Apple",
    model: "iPhone 16",
    category: "celular",
    authenticity: "original",
    storage: "128GB",
    color: null,
    grade: "sellado",
    batteryHealth: null,
    currency: "USD",
    cost: 825,
    quantity: 1,
    notes: null,
    ...p,
  } as ParsedRow;
}

function lista(
  id: string,
  filas: ParsedRow[],
  phone: string | null = null
): ListaDeProveedor {
  const proveedor: Supplier = {
    id,
    name: id,
    phone,
    defaultMarginPct: 5,
    isActive: true,
  };
  return { proveedor, fecha: "2026-11-04T12:00:00Z", filas };
}

describe("armarMercado", () => {
  it("junta las ofertas de un equipo y ordena de más barata a más cara", () => {
    const [equipo, ...resto] = armarMercado(
      [lista("Fany", [fila({ cost: 850 })]), lista("TechDog", [fila({ cost: 825 })])],
      1662.49
    );

    expect(resto).toHaveLength(0);
    expect(equipo.ofertas.map((o) => o.proveedor)).toEqual(["TechDog", "Fany"]);
    expect(equipo.precioUsd).toBe(867);
  });

  it("compara monedas distintas en dólares", () => {
    const [equipo] = armarMercado(
      [
        lista("Dolar", [fila({ cost: 900 })]),
        lista("Pesos", [fila({ cost: 1_000_000, currency: "ARS" })]),
      ],
      1250
    );
    expect(equipo.ofertas[0].proveedor).toBe("Pesos");
  });

  it("no mezcla un sellado con un usado ni una réplica con un original", () => {
    const equipos = armarMercado(
      [lista("A", [fila(), fila({ grade: "a" }), fila({ authenticity: "replica" })])],
      1500
    );
    expect(equipos).toHaveLength(3);
  });
});

describe("consulta de stock", () => {
  it("no toma un identificador interno por un teléfono", () => {
    expect(esTelefonoReal("5492214941732")).toBe(true);
    expect(esTelefonoReal("153270672691321")).toBe(false);
    expect(esTelefonoReal("40102763970655")).toBe(false);
    expect(esTelefonoReal("54123")).toBe(false);
    expect(esTelefonoReal(null)).toBe(false);
  });

  it("arma el mensaje con el equipo y el costo de esa oferta", () => {
    const [equipo] = armarMercado([lista("Fany", [fila()])], 1500);
    expect(mensajeDeStock(equipo, equipo.ofertas[0])).toBe(
      "Hola! ¿Tenés stock de iPhone 16 128GB sellado a USD 825? Gracias!"
    );
  });
});
