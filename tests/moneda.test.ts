import { describe, expect, it } from "vitest";
import { antiguedadCotizacion, esMoneda } from "@/lib/moneda";
import { formatUSD } from "@/utils/format";

describe("esMoneda", () => {
  it("acepta las dos monedas del sitio", () => {
    expect(esMoneda("ars")).toBe(true);
    expect(esMoneda("usd")).toBe(true);
  });

  it("rechaza cualquier otra cosa", () => {
    // Lo que llega de localStorage es texto libre: puede haber quedado un
    // valor viejo, o alguien puede haberlo editado a mano.
    expect(esMoneda("eur")).toBe(false);
    expect(esMoneda("ARS")).toBe(false);
    expect(esMoneda(null)).toBe(false);
    expect(esMoneda(undefined)).toBe(false);
    expect(esMoneda(1)).toBe(false);
  });
});

describe("antiguedadCotizacion", () => {
  const ahora = new Date("2026-09-04T12:00:00");
  const haceDias = (d: number) =>
    new Date(ahora.getTime() - d * 86_400_000).toISOString();

  it("dice hoy y ayer con esas palabras", () => {
    expect(antiguedadCotizacion(haceDias(0), ahora)).toBe("actualizada hoy");
    expect(antiguedadCotizacion(haceDias(1), ahora)).toBe("actualizada ayer");
  });

  it("cuenta los días dentro de la semana", () => {
    expect(antiguedadCotizacion(haceDias(3), ahora)).toBe("actualizada hace 3 días");
  });

  it("pasa a semanas y después corta en más de un mes", () => {
    expect(antiguedadCotizacion(haceDias(9), ahora)).toBe("actualizada hace una semana");
    expect(antiguedadCotizacion(haceDias(20), ahora)).toBe("actualizada hace 2 semanas");
    expect(antiguedadCotizacion(haceDias(60), ahora)).toBe(
      "actualizada hace más de un mes"
    );
  });

  it("no dice nada si la fecha no se entiende", () => {
    // Mejor sin la línea que con un 'Invalid Date' al lado del precio.
    expect(antiguedadCotizacion("cualquier cosa", ahora)).toBe("");
  });

  it("trata una fecha futura como hoy", () => {
    // Pasa con el reloj del visitante adelantado: 'actualizada en 2 días' no
    // significa nada para quien lee.
    const futuro = new Date(ahora.getTime() + 2 * 86_400_000).toISOString();
    expect(antiguedadCotizacion(futuro, ahora)).toBe("actualizada hoy");
  });
});

describe("formatUSD", () => {
  it("escribe US$ y no $, que acá es pesos", () => {
    // Debajo de "$ 1.218.000", un "$840" se lee como una rebaja imposible.
    expect(formatUSD(840)).toBe("US$ 840");
    expect(formatUSD(840)).not.toMatch(/^\$/);
  });

  it("separa los miles como se leen acá", () => {
    expect(formatUSD(1250)).toBe("US$ 1.250");
  });

  it("no muestra centavos", () => {
    expect(formatUSD(999.6)).toBe("US$ 1.000");
  });
});
