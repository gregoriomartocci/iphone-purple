import { describe, expect, it } from "vitest";
import {
  desviado,
  gananciaUsd,
  margenReal,
  precioArs,
  precioUsd,
  resolverMargen,
  type ReglasMargen,
} from "@/lib/margen";

const REGLAS: ReglasMargen = {
  general: { tipo: "porcentaje", valor: 18 },
  porCategoria: { accesorio: { tipo: "fijo", valor: 8 } },
  porProveedor: { "prov-1": { tipo: "porcentaje", valor: 12 } },
  porProducto: { "iphone-15-pro": { tipo: "fijo", valor: 120 } },
};

describe("resolverMargen", () => {
  it("sin nada específico usa el general", () => {
    expect(resolverMargen(REGLAS, { category: "celular" })).toEqual({
      tipo: "porcentaje",
      valor: 18,
      origen: "general",
    });
  });

  it("la categoría le gana al general", () => {
    expect(resolverMargen(REGLAS, { category: "accesorio" }).origen).toBe("categoria");
  });

  it("el proveedor le gana a la categoría", () => {
    // Un mayorista con el que se trabaja a menos margen manda sobre la regla
    // amplia del rubro.
    const r = resolverMargen(REGLAS, { category: "accesorio", supplierId: "prov-1" });
    expect(r.origen).toBe("proveedor");
    expect(r.valor).toBe(12);
  });

  it("el producto le gana a todo", () => {
    const r = resolverMargen(REGLAS, {
      slug: "iphone-15-pro",
      supplierId: "prov-1",
      category: "celular",
    });
    expect(r.origen).toBe("producto");
    expect(r).toMatchObject({ tipo: "fijo", valor: 120 });
  });

  it("un proveedor sin regla propia no rompe la cascada", () => {
    expect(
      resolverMargen(REGLAS, { supplierId: "prov-9", category: "celular" }).origen
    ).toBe("general");
  });
});

describe("precioUsd", () => {
  it("aplica el porcentaje", () => {
    expect(precioUsd(600, { tipo: "porcentaje", valor: 18 })).toBe(708);
  });

  it("aplica el monto fijo", () => {
    // Sobre un cable de US$ 4 un 18 % son 72 centavos: no paga ni atender la
    // venta. Por eso lo barato va con monto fijo.
    expect(precioUsd(4, { tipo: "fijo", valor: 8 })).toBe(12);
  });

  it("redondea a dólar entero", () => {
    expect(precioUsd(333, { tipo: "porcentaje", valor: 15 })).toBe(383);
  });

  it("nunca devuelve negativo", () => {
    expect(precioUsd(10, { tipo: "fijo", valor: -50 })).toBe(0);
  });
});

describe("precioArs", () => {
  it("redondea hacia arriba a los diez mil", () => {
    // Hacia arriba: redondear para abajo se come margen en cada equipo.
    expect(precioArs(708, 1450)).toBe(1_030_000);
    expect(precioArs(100, 1450)).toBe(150_000);
  });

  it("deja quieto lo que ya cae justo", () => {
    expect(precioArs(1000, 1000)).toBe(1_000_000);
  });
});

describe("margenReal", () => {
  it("dice el margen que el precio tiene de verdad", () => {
    expect(margenReal(600, 708)).toBeCloseTo(18, 5);
  });

  it("con costo cero no devuelve infinito", () => {
    // Pasa con los equipos cargados sin costo; un "∞ %" en la tabla no informa.
    expect(margenReal(0, 500)).toBeNull();
  });

  it("puede ser negativo si se vende bajo costo", () => {
    expect(margenReal(600, 540)).toBeCloseTo(-10, 5);
  });
});

describe("gananciaUsd", () => {
  it("resta el costo del precio", () => {
    expect(gananciaUsd(600, 708)).toBe(108);
  });
});

describe("desviado", () => {
  const margen = { tipo: "porcentaje", valor: 18 } as const;

  it("no marca lo que está en su precio", () => {
    expect(desviado(600, 708, margen)).toBe(false);
  });

  it("tolera el corrimiento del redondeo", () => {
    // El precio en pesos se redondea a los diez mil y eso mueve el margen uno o
    // dos puntos sin que nadie haya hecho nada mal.
    expect(desviado(600, 715, margen)).toBe(false);
  });

  it("marca un precio que quedó atrás de una lista nueva", () => {
    expect(desviado(600, 640, margen)).toBe(true);
  });

  it("marca también el precio de más", () => {
    expect(desviado(600, 900, margen)).toBe(true);
  });

  it("con costo cero no marca nada", () => {
    expect(desviado(0, 500, margen)).toBe(false);
  });
});
