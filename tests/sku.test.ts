import { describe, expect, it } from "vitest";
/* Se importan de `sincronizar` y no de `lib/admin/publicar`: ese módulo es
   `server-only` y no se puede cargar desde un test. Que vivan al lado de
   `claveEquipo` es justamente el punto: tienen que coincidir. */
import { claveEquipo, skuDe, skuDesdeClave } from "@/lib/whatsapp/sincronizar";
import type { ParsedRow } from "@/types";

function fila(p: Partial<ParsedRow> = {}): ParsedRow {
  return {
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    category: "celular",
    authenticity: "original",
    storage: "256GB",
    color: null,
    grade: "a",
    batteryHealth: null,
    currency: "USD",
    cost: 1150,
    quantity: 1,
    notes: null,
    ...p,
  } as ParsedRow;
}

describe("skuDe", () => {
  it("arma un SKU legible para un original", () => {
    expect(skuDe(fila())).toBe("IPHONE-15-PRO-MAX-256GB-a");
  });

  /*
   * El caso que motivó todo: sin el sufijo, una réplica y un original del mismo
   * modelo, capacidad y grado compartían SKU. Al publicar, uno pisaba al otro y
   * un equipo original quedaba con el precio —y la marca— de una réplica.
   */
  it("una réplica no comparte SKU con el original equivalente", () => {
    const original = skuDe(fila({ authenticity: "original" }));
    const replica = skuDe(fila({ authenticity: "replica" }));
    expect(replica).not.toBe(original);
    expect(replica).toBe("IPHONE-15-PRO-MAX-256GB-a-REPLICA");
  });

  it("sin capacidad no deja el hueco vacío", () => {
    expect(skuDe(fila({ storage: "" }))).toContain("-NA-");
  });

  it("el grado cambia el SKU: no es la misma variante", () => {
    expect(skuDe(fila({ grade: "sellado" }))).not.toBe(skuDe(fila({ grade: "a" })));
  });
});

describe("skuDesdeClave", () => {
  /*
   * Esto es lo que hace que poner en cero el stock apunte a la variante que se
   * publicó. Si los dos caminos no coinciden, se pone en cero otra cosa.
   */
  it.each([
    ["un original", fila()],
    ["una réplica", fila({ authenticity: "replica" })],
    ["sin capacidad", fila({ storage: "" })],
    ["sellado", fila({ grade: "sellado" })],
    ["otro modelo", fila({ model: "MacBook Air M2", storage: "512GB" })],
  ])("da el mismo SKU que skuDe para %s", (_, f) => {
    expect(skuDesdeClave(claveEquipo(f))).toBe(skuDe(f));
  });
});
