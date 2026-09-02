import { describe, expect, it } from "vitest";
import { sellPrice } from "@/lib/whatsapp/parser";
import { CONDITION_MULTIPLIER, quoteTradeIn } from "@/lib/catalog";
import type { TradeInPrice } from "@/types";

/**
 * Precios y márgenes.
 *
 * Es la lógica donde un error cuesta plata de verdad: un margen mal aplicado se
 * publica en el catálogo y se vende así hasta que alguien lo note.
 */

describe("sellPrice", () => {
  const RATE = 1450;

  it("aplica el margen sobre un costo en dólares", () => {
    const result = sellPrice(1000, "USD", 20, RATE);
    expect(result.costUsd).toBe(1000);
    expect(result.priceUsd).toBe(1200);
  });

  it("convierte un costo en pesos a dólares antes de aplicar el margen", () => {
    // 1.450.000 ARS a 1450 = USD 1000; +20% = USD 1200.
    const result = sellPrice(1_450_000, "ARS", 20, RATE);
    expect(result.costUsd).toBe(1000);
    expect(result.priceUsd).toBe(1200);
  });

  it("redondea el precio en pesos hacia arriba a la decena de miles", () => {
    // USD 1200 × 1450 = 1.740.000, que ya es múltiplo de 10.000.
    expect(sellPrice(1000, "USD", 20, RATE).priceArs).toBe(1_740_000);

    // USD 347 × 1450 = 503.150 → 510.000.
    expect(sellPrice(347, "USD", 0, RATE).priceArs).toBe(510_000);
  });

  it("nunca devuelve un precio en pesos por debajo del valor real", () => {
    for (const cost of [99, 250, 333, 777, 1234]) {
      const result = sellPrice(cost, "USD", 18, RATE);
      expect(result.priceArs).toBeGreaterThanOrEqual(result.priceUsd * RATE);
    }
  });

  it("con margen cero el precio iguala el costo", () => {
    const result = sellPrice(500, "USD", 0, RATE);
    expect(result.priceUsd).toBe(500);
  });

  it("mantiene el margen proporcional al costo", () => {
    const barato = sellPrice(200, "USD", 25, RATE);
    const caro = sellPrice(2000, "USD", 25, RATE);
    expect(caro.priceUsd / caro.costUsd).toBeCloseTo(barato.priceUsd / barato.costUsd, 2);
  });
});

describe("quoteTradeIn", () => {
  const base: TradeInPrice = {
    id: "t1",
    brand: "Apple",
    model: "iPhone 15",
    storage: "128GB",
    baseValue: 500,
  };

  it("toma el valor base tal cual para un equipo muy bueno", () => {
    expect(quoteTradeIn(base, "muy-bueno")).toBe(500);
  });

  it("paga más por un equipo en mejor estado", () => {
    expect(quoteTradeIn(base, "nuevo")).toBeGreaterThan(quoteTradeIn(base, "como-nuevo"));
    expect(quoteTradeIn(base, "como-nuevo")).toBeGreaterThan(
      quoteTradeIn(base, "muy-bueno")
    );
    expect(quoteTradeIn(base, "muy-bueno")).toBeGreaterThan(quoteTradeIn(base, "bueno"));
  });

  it("redondea a múltiplos de 5 para no cotizar cifras raras", () => {
    const raro: TradeInPrice = { ...base, baseValue: 333 };
    for (const condition of ["nuevo", "como-nuevo", "muy-bueno", "bueno"] as const) {
      expect(quoteTradeIn(raro, condition) % 5).toBe(0);
    }
  });

  it("nunca cotiza en negativo", () => {
    const cero: TradeInPrice = { ...base, baseValue: 0 };
    expect(quoteTradeIn(cero, "bueno")).toBe(0);
  });

  it("usa los mismos porcentajes que publicamos en el blog", () => {
    // Si estos números cambian, hay que actualizar la nota "Plan Canje: cómo
    // calculamos lo que vale tu equipo", que los enumera explícitamente.
    expect(CONDITION_MULTIPLIER["como-nuevo"]).toBe(1.15);
    expect(CONDITION_MULTIPLIER["muy-bueno"]).toBe(1);
    expect(CONDITION_MULTIPLIER.bueno).toBe(0.85);
  });
});
