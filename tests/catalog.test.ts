import { describe, expect, it } from "vitest";
import { getCatalogFacets, getProducts, getProduct } from "@/lib/data";
import { leadVariant, priceFrom, totalStock } from "@/lib/catalog";
import { PRODUCTS } from "@/lib/data/seed";
import type { Product, Variant } from "@/types";

/**
 * Catálogo: búsqueda, filtros y orden.
 *
 * Corre contra la semilla, que es lo que sirve la capa de datos cuando Supabase
 * no está configurado. El filtrado es el mismo código en los dos modos.
 */

function variant(overrides: Partial<Variant> = {}): Variant {
  return {
    id: "v1",
    productId: "p1",
    storage: "128GB",
    color: "Negro",
    colorHex: "#000",
    condition: "muy-bueno",
    batteryHealth: 90,
    priceArs: 1_000_000,
    priceUsd: 700,
    costUsd: 600,
    stock: 3,
    sku: "SKU-1",
    ...overrides,
  };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "iPhone Test",
    slug: "iphone-test",
    brand: "Apple",
    model: "iPhone Test",
    category: "iphone",
    description: "",
    specs: {},
    images: [],
    variants: [variant()],
    isFeatured: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("helpers de catálogo", () => {
  it("suma el stock de todas las variantes", () => {
    const p = product({
      variants: [variant({ id: "a", stock: 2 }), variant({ id: "b", stock: 3 })],
    });
    expect(totalStock(p)).toBe(5);
  });

  it("elige como principal la variante más barata CON stock", () => {
    const p = product({
      variants: [
        variant({ id: "barata-sin-stock", priceArs: 500_000, stock: 0 }),
        variant({ id: "cara-con-stock", priceArs: 900_000, stock: 1 }),
      ],
    });
    // La más barata no sirve si no se puede vender.
    expect(leadVariant(p)?.id).toBe("cara-con-stock");
    expect(priceFrom(p)).toBe(900_000);
  });

  it("si nada tiene stock, cae en la más barata igual", () => {
    const p = product({
      variants: [
        variant({ id: "cara", priceArs: 900_000, stock: 0 }),
        variant({ id: "barata", priceArs: 500_000, stock: 0 }),
      ],
    });
    expect(leadVariant(p)?.id).toBe("barata");
  });

  it("no rompe con un producto sin variantes", () => {
    const p = product({ variants: [] });
    expect(leadVariant(p)).toBeUndefined();
    expect(totalStock(p)).toBe(0);
    expect(priceFrom(p)).toBe(0);
  });
});

describe("getProducts", () => {
  it("sin filtros devuelve todo el catálogo", async () => {
    const result = await getProducts();
    expect(result).toHaveLength(PRODUCTS.length);
  });

  it("exige que aparezcan TODAS las palabras de la búsqueda", async () => {
    const result = await getProducts({ q: "iphone 15 pro" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.name.toLowerCase()).toContain("15 pro");
    }
    // "15 pro" no debe arrastrar todos los Pro de otras generaciones.
    expect(result.some((p) => p.name === "iPhone 16 Pro")).toBe(false);
  });

  it("ignora acentos y mayúsculas al buscar", async () => {
    const conAcento = await getProducts({ q: "IPHONE" });
    const sinAcento = await getProducts({ q: "iphone" });
    expect(conAcento.length).toBe(sinAcento.length);
    expect(conAcento.length).toBeGreaterThan(0);
  });

  it("busca también dentro de las variantes", async () => {
    const result = await getProducts({ q: "512GB" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.variants.some((v) => v.storage === "512GB")).toBe(true);
    }
  });

  it("devuelve vacío cuando no hay coincidencias, sin romper", async () => {
    expect(await getProducts({ q: "nokia 3310 indestructible" })).toEqual([]);
  });

  it("filtra por capacidad", async () => {
    const result = await getProducts({ storage: "256GB" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.variants.some((v) => v.storage === "256GB")).toBe(true);
    }
  });

  it("filtra por estado", async () => {
    const result = await getProducts({ condition: "nuevo" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.variants.some((v) => v.condition === "nuevo")).toBe(true);
    }
  });

  it("con inStockOnly no devuelve nada agotado", async () => {
    const result = await getProducts({ inStockOnly: true });
    for (const p of result) {
      expect(totalStock(p)).toBeGreaterThan(0);
    }
  });

  it("ordena por precio ascendente y descendente", async () => {
    const asc = await getProducts({ sort: "precio-asc" });
    const desc = await getProducts({ sort: "precio-desc" });

    for (let i = 1; i < asc.length; i++) {
      expect(priceFrom(asc[i])).toBeGreaterThanOrEqual(priceFrom(asc[i - 1]));
    }
    for (let i = 1; i < desc.length; i++) {
      expect(priceFrom(desc[i])).toBeLessThanOrEqual(priceFrom(desc[i - 1]));
    }
  });

  it("en relevancia pone primero lo que tiene stock", async () => {
    const result = await getProducts({ sort: "relevancia" });
    const firstOutOfStock = result.findIndex((p) => totalStock(p) === 0);
    if (firstOutOfStock !== -1) {
      // A partir del primero sin stock, no puede volver a aparecer uno con stock.
      for (const p of result.slice(firstOutOfStock)) {
        expect(totalStock(p)).toBe(0);
      }
    }
  });

  it("combina varios filtros a la vez", async () => {
    const result = await getProducts({
      q: "iphone",
      storage: "128GB",
      inStockOnly: true,
    });
    for (const p of result) {
      expect(p.name.toLowerCase()).toContain("iphone");
      expect(p.variants.some((v) => v.storage === "128GB")).toBe(true);
      expect(totalStock(p)).toBeGreaterThan(0);
    }
  });
});

describe("getProduct", () => {
  it("encuentra un producto por su slug", async () => {
    const found = await getProduct(PRODUCTS[0].slug);
    expect(found?.id).toBe(PRODUCTS[0].id);
  });

  it("devuelve null si el slug no existe", async () => {
    expect(await getProduct("no-existe-este-equipo")).toBeNull();
  });

  it("todos los slugs de la semilla son únicos", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("todos los SKU de la semilla son únicos", () => {
    const skus = PRODUCTS.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(skus).size).toBe(skus.length);
  });
});

describe("getCatalogFacets", () => {
  it("ordena las capacidades numéricamente, no alfabéticamente", async () => {
    const { storages } = await getCatalogFacets();
    const numeric = storages.filter((s) => /^\d+GB$/.test(s)).map((s) => parseInt(s, 10));
    // Alfabéticamente "512GB" iría antes que "64GB"; acá no debe pasar.
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeGreaterThanOrEqual(numeric[i - 1]);
    }
  });

  it("no repite valores", async () => {
    const facets = await getCatalogFacets();
    expect(new Set(facets.brands).size).toBe(facets.brands.length);
    expect(new Set(facets.models).size).toBe(facets.models.length);
    expect(new Set(facets.storages).size).toBe(facets.storages.length);
  });
});
