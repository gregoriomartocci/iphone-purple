import { describe, expect, it } from "vitest";
import {
  SEPARADOR_DE_MENSAJES,
  sellPrice,
  trozosDeLista,
  validarLista,
} from "@/lib/whatsapp/parser";

const FILA = {
  brand: "Apple",
  model: "iPhone 15",
  storage: "128GB",
  color: null,
  category: "celular",
  grade: "a",
  authenticity: "original",
  batteryHealth: null,
  currency: "USD",
  cost: 700,
  quantity: 1,
  notes: null,
};

describe("validarLista", () => {
  it("descarta la fila incompleta sin perder las demás ni completarla", () => {
    const r = validarLista({
      rows: [FILA, { ...FILA, model: "Osmo Nano", brand: null }],
      warnings: ["aviso previo"],
    });

    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].model).toBe("iPhone 15");
    expect(r.warnings[0]).toBe("aviso previo");
    expect(r.warnings[1]).toMatch(/brand.*Osmo Nano/);
  });

  it("rechaza una respuesta que no tiene forma de lista", () => {
    expect(() => validarLista({ hola: 1 })).toThrow(/forma de lista/);
  });
});

describe("trozosDeLista", () => {
  it("agrupa mensajes sin partir ninguno", () => {
    const grande = "x".repeat(5_000);
    const trozos = trozosDeLista(
      [`A${grande}`, `B${grande}`, "C corto"].join(SEPARADOR_DE_MENSAJES)
    );

    expect(trozos).toHaveLength(2);
    expect(trozos[0].startsWith("A")).toBe(true);
    expect(trozos[1]).toContain("C corto");
    expect(trozos.join("")).not.toContain("mensaje siguiente");
  });

  it("deja igual una lista de un solo mensaje, aunque sea larga", () => {
    const uno = "y".repeat(20_000);
    expect(trozosDeLista(uno)).toEqual([uno]);
  });
});

describe("sellPrice", () => {
  it("nunca queda por debajo del costo más el margen", () => {
    const { priceUsd, priceArs } = sellPrice(825, "USD", 5, 1662.49);
    expect(priceUsd).toBe(867);
    expect(priceArs).toBeGreaterThanOrEqual(825 * 1.05 * 1662.49);
  });

  it("no suma un dólar de más por los decimales", () => {
    expect(sellPrice(1000, "USD", 5, 1662.49).priceUsd).toBe(1050);
  });
});
