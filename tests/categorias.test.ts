import { describe, expect, it } from "vitest";
import { etiquetaCategoria } from "@/types";

describe("etiquetaCategoria", () => {
  it("con Apple usa los nombres de Apple", () => {
    expect(etiquetaCategoria("celular", "Apple")).toBe("iPhone");
    expect(etiquetaCategoria("tablet", "apple")).toBe("iPad");
    expect(etiquetaCategoria("notebook", "Apple")).toBe("Mac");
    expect(etiquetaCategoria("reloj", "Apple")).toBe("Apple Watch");
    expect(etiquetaCategoria("audio", "Apple")).toBe("AirPods");
    expect(etiquetaCategoria("accesorio", "Apple")).toBe("Accesorios");
  });

  it("sin marca o con otra marca, la categoría genérica", () => {
    expect(etiquetaCategoria("celular")).toBe("Celulares");
    expect(etiquetaCategoria("tablet", "Samsung")).toBe("Tablets");
  });
});
