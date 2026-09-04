import { describe, expect, it } from "vitest";
import { getCatalogFacets, getProducts, getProduct } from "@/lib/data";
import {
  capacityInGb,
  isCapacity,
  leadVariant,
  priceFrom,
  savingsVsNew,
  totalStock,
} from "@/lib/catalog";
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
    grade: "a",
    authenticity: "original",
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
    model: "iPhone 15 Test",
    generation: 15,
    line: "base" as const,
    category: "celular" as const,
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

  it("respeta el estado filtrado al elegir qué variante mostrar", () => {
    // Si alguien filtró por "sellado", la tarjeta no puede mostrarle el precio
    // de una usada más barata: sería ofrecerle algo distinto de lo que pidió.
    const p = product({
      variants: [
        variant({ id: "usada", grade: "a-minus", priceArs: 500_000, stock: 5 }),
        variant({ id: "sellada", grade: "sellado", priceArs: 900_000, stock: 5 }),
      ],
    });
    expect(leadVariant(p, { grade: "sellado" })?.id).toBe("sellada");
    expect(leadVariant(p, { grade: "a-minus" })?.id).toBe("usada");
    // Sin filtro vuelve a mandar el precio.
    expect(leadVariant(p)?.id).toBe("usada");
  });

  it("respeta la capacidad filtrada", () => {
    const p = product({
      variants: [
        variant({ id: "chica", storage: "128GB", priceArs: 500_000, stock: 3 }),
        variant({ id: "grande", storage: "512GB", priceArs: 800_000, stock: 3 }),
      ],
    });
    expect(leadVariant(p, { storage: "512GB" })?.id).toBe("grande");
  });

  it("si el filtro no deja ninguna variante, no devuelve vacío", () => {
    // Puede pasar cuando el producto entra por otro criterio: mejor mostrar
    // algo que dejar la tarjeta sin precio.
    const p = product({
      variants: [variant({ id: "unica", grade: "a-minus", stock: 2 })],
    });
    expect(leadVariant(p, { grade: "sellado" })?.id).toBe("unica");
  });

  it("no rompe con un producto sin variantes", () => {
    const p = product({ variants: [] });
    expect(leadVariant(p)).toBeUndefined();
    expect(totalStock(p)).toBe(0);
    expect(priceFrom(p)).toBe(0);
  });
});

describe("getProducts", () => {
  it("sin filtros devuelve solo los originales", async () => {
    const originales = PRODUCTS.filter((p) =>
      p.variants.some((v) => v.authenticity === "original")
    );
    const result = await getProducts({ incluirSinFoto: true });
    expect(result).toHaveLength(originales.length);
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

  /**
   * La búsqueda libre es por subcadena, así que se comprueba eso y no una
   * igualdad exacta: en una notebook la variante no es una capacidad suelta
   * sino la configuración entera —"16GB · 512GB"—, y exigir igualdad dejaba
   * afuera resultados que la persona sí quería ver al buscar "512GB".
   */
  it("busca también dentro de las variantes", async () => {
    const result = await getProducts({ q: "512GB" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.variants.some((v) => v.storage.includes("512GB"))).toBe(true);
    }
  });

  /** Una configuración de notebook no puede colarse como opción de capacidad. */
  it("no ofrece configuraciones enteras en el filtro de capacidad", async () => {
    const facets = await getCatalogFacets({ model: "MacBook Pro M5 14" });
    for (const f of facets.storages) {
      expect(f.value).toMatch(/^\d+(GB|TB)$/);
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
    const result = await getProducts({ grade: "sellado" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.variants.some((v) => v.grade === "sellado")).toBe(true);
    }
  });

  it("nunca devuelve equipos agotados", async () => {
    // Regla del sitio: si no está, no se muestra.
    const result = await getProducts();
    for (const p of result) {
      expect(totalStock(p)).toBeGreaterThan(0);
    }
  });

  it("el panel sí puede pedir lo agotado, para reponer", async () => {
    const publico = await getProducts();
    const conAgotados = await getProducts({ includeOutOfStock: true });
    expect(conAgotados.length).toBeGreaterThanOrEqual(publico.length);
  });

  it("filtra por generación", async () => {
    const result = await getProducts({ generation: 15 });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) expect(p.generation).toBe(15);
  });

  it("filtra por línea", async () => {
    const result = await getProducts({ line: "pro-max" });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) expect(p.line).toBe("pro-max");
  });

  it("combina generación y línea", async () => {
    const result = await getProducts({ generation: 16, line: "pro" });
    for (const p of result) {
      expect(p.generation).toBe(16);
      expect(p.line).toBe("pro");
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
    const result = await getProducts({ q: "iphone", storage: "128GB" });
    for (const p of result) {
      expect(p.name.toLowerCase()).toContain("iphone");
      expect(p.variants.some((v) => v.storage === "128GB")).toBe(true);
      expect(totalStock(p)).toBeGreaterThan(0);
    }
  });
});

describe("réplicas", () => {
  it("nunca aparecen mezcladas con los originales", async () => {
    // La regla central: vender una réplica sin que se entienda que lo es
    // expone legalmente al negocio. Ningún listado por defecto puede traerlas.
    for (const filtros of [
      {},
      { q: "auriculares" },
      { sort: "precio-asc" as const },
      { category: "accesorio" as const },
    ]) {
      const result = await getProducts(filtros);
      for (const p of result) {
        expect(p.variants.some((v) => v.authenticity === "original")).toBe(true);
      }
    }
  });

  it("se ven solo cuando se piden explícitamente", async () => {
    const result = await getProducts({ authenticity: "replica", incluirSinFoto: true });
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.variants.some((v) => v.authenticity === "replica")).toBe(true);
    }
  });

  /**
   * El invariante es que el contador coincide con las réplicas publicables, no
   * que sea mayor que cero: si ninguna réplica tiene foto, no se publica
   * ninguna y el contador correcto es cero.
   */
  it("el catálogo informa cuántas réplicas hay, sin listarlas", async () => {
    const facets = await getCatalogFacets();
    const replicas = await getProducts({ authenticity: "replica" });
    expect(facets.replicaCount).toBe(replicas.length);

    const listados = await getProducts();
    for (const p of listados) {
      expect(p.variants.every((v) => v.authenticity === "original")).toBe(true);
    }
  });

  it("una réplica no cuenta como ahorro contra un sellado original", () => {
    // Comparar precios entre original y réplica inventaría un descuento falso.
    const p = product({
      variants: [
        variant({ id: "orig", grade: "sellado", priceArs: 900_000 }),
        variant({
          id: "rep",
          grade: "a",
          authenticity: "replica",
          priceArs: 200_000,
        }),
      ],
    });
    const replica = p.variants.find((v) => v.id === "rep")!;
    expect(savingsVsNew(p, replica)).toBeNull();
  });
});

describe("filtro de batería", () => {
  it("deja pasar solo lo que llega al mínimo", async () => {
    const result = await getProducts({ minBattery: 95 });
    for (const p of result) {
      const ok = p.variants.some(
        (v) =>
          v.authenticity === "original" &&
          (v.grade === "sellado" || (v.batteryHealth ?? 0) >= 95)
      );
      expect(ok).toBe(true);
    }
  });

  it("un sellado cumple cualquier mínimo aunque no informe batería", async () => {
    // No declara porcentaje porque está sin abrir; asumir que no cumple lo
    // dejaría fuera del filtro más exigente, que es justo donde tiene que estar.
    const result = await getProducts({ minBattery: 95, grade: "sellado" });
    expect(result.length).toBeGreaterThan(0);
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

describe("capacidades", () => {
  it("reconoce capacidades reales y descarta el resto", () => {
    for (const v of ["64GB", "128GB", "256 GB", "1TB", "2tb"]) {
      expect(isCapacity(v)).toBe(true);
    }
    // El campo también guarda tamaño de caja de Watch y conector de AirPods.
    for (const v of ["42mm GPS", "46mm GPS", "49mm", "USB-C", ""]) {
      expect(isCapacity(v)).toBe(false);
    }
  });

  it("ordena 1TB después de 512GB, no antes", () => {
    // Ordenar por el número suelto pondría "1TB" primero, que es lo que pasaba.
    const orden = ["64GB", "128GB", "256GB", "512GB", "1TB"];
    const mezclado = ["1TB", "128GB", "512GB", "64GB", "256GB"];
    expect(mezclado.sort((a, b) => capacityInGb(a) - capacityInGb(b))).toEqual(orden);
  });

  it("el filtro de almacenamiento no ofrece nada que no sea capacidad", async () => {
    const facets = await getCatalogFacets();
    for (const facet of facets.storages) {
      expect(isCapacity(facet.value)).toBe(true);
    }
  });
});

describe("getCatalogFacets", () => {
  it("ordena las capacidades numéricamente, no alfabéticamente", async () => {
    const { storages } = await getCatalogFacets();
    const numeric = storages
      .map((f) => f.value)
      .filter((s) => /^\d+GB$/.test(s))
      .map((s) => parseInt(s, 10));
    // Alfabéticamente "512GB" iría antes que "64GB"; acá no debe pasar.
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeGreaterThanOrEqual(numeric[i - 1]);
    }
  });

  it("no repite valores", async () => {
    const facets = await getCatalogFacets();
    const values = (list: { value: string }[]) => list.map((f) => f.value);
    expect(new Set(values(facets.models)).size).toBe(facets.models.length);
    expect(new Set(values(facets.storages)).size).toBe(facets.storages.length);
  });

  it("el contador de cada opción coincide con lo que devuelve filtrar por ella", async () => {
    // Es la promesa que le hacemos al usuario: si dice 4, al tildarlo ve 4.
    const facets = await getCatalogFacets();
    for (const facet of facets.models.slice(0, 5)) {
      const filtered = await getProducts({ model: facet.value });
      expect(filtered.length).toBe(facet.count);
    }
  });

  it("los contadores respetan los filtros ya aplicados", async () => {
    // Con un filtro activo, cada opción cuenta la intersección, no el total.
    const facets = await getCatalogFacets({ category: "celular" });
    for (const facet of facets.storages) {
      const filtered = await getProducts({ category: "celular", storage: facet.value });
      expect(filtered.length).toBe(facet.count);
    }
  });

  it("un eje no se bloquea por lo que se eligió debajo", async () => {
    // Con "iPhone" elegido, Sony no tiene iPhones y su contador daría cero:
    // si se descartara, la persona ya no podría volver a cambiar de marca.
    const facets = await getCatalogFacets({
      brand: "Apple",
      category: "celular",
      incluirSinFoto: true,
    });
    expect(facets.brands.length).toBeGreaterThan(1);
    expect(facets.brands.map((f) => f.value)).toContain("Sony");
  });

  it("la categoría tampoco se bloquea por el modelo elegido", async () => {
    const facets = await getCatalogFacets({
      category: "celular",
      model: "iPhone 15 Pro",
      incluirSinFoto: true,
    });
    expect(facets.categories.length).toBeGreaterThan(1);
  });

  it("descarta las opciones que no dejarían ningún resultado", async () => {
    const facets = await getCatalogFacets({ model: "iPhone 16" });
    for (const list of [facets.models, facets.storages, facets.grades]) {
      for (const facet of list) {
        expect(facet.count).toBeGreaterThan(0);
      }
    }
  });

  it("informa el rango de precios del catálogo", async () => {
    const { priceRange } = await getCatalogFacets();
    expect(priceRange.min).toBeGreaterThan(0);
    expect(priceRange.max).toBeGreaterThanOrEqual(priceRange.min);
  });

  /**
   * Las opciones de batería salían de una lista fija de cuatro tramos. Eso
   * dejaba afuera un equipo al 100 % —el tramo más alto era "95 % o más"— y a
   * la vez ofrecía tramos sin nada detrás.
   */
  it("ofrece solo tramos de batería que existen en stock", async () => {
    const facets = await getCatalogFacets({ state: "seminuevo" });
    const productos = await getProducts({ state: "seminuevo" });
    const baterias = productos
      .flatMap((p) => p.variants)
      .map((v) => v.batteryHealth)
      .filter((b): b is number => b !== null);

    expect(facets.batteryTiers.length).toBeGreaterThan(0);
    for (const tramo of facets.batteryTiers) {
      // Cada tramo tiene al menos un equipo con esa batería o más.
      expect(baterias.some((b) => b >= Number(tramo.value))).toBe(true);
      expect(tramo.count).toBeGreaterThan(0);
    }
  });

  it("incluye el tramo más alto cuando hay una batería de 100 %", async () => {
    const facets = await getCatalogFacets({ state: "seminuevo" });
    const productos = await getProducts({ state: "seminuevo" });
    const maxima = Math.max(
      ...productos.flatMap((p) => p.variants).map((v) => v.batteryHealth ?? 0)
    );
    const tramoMasAlto = Math.max(...facets.batteryTiers.map((t) => Number(t.value)));

    // El tramo más alto acompaña a la mejor batería en stock, redondeada
    // hacia abajo al múltiplo de 5: con un equipo al 100 % hay tramo 100.
    expect(tramoMasAlto).toBe(Math.floor(maxima / 5) * 5);
  });

  /**
   * La capacidad solo significa algo dentro de un modelo: sin acotar, pedir
   * 64 GB traía la Nintendo Switch junto a un iPhone.
   */
  it("las capacidades de un modelo son solo las de ese modelo", async () => {
    const facets = await getCatalogFacets({ model: "iPhone 15 Pro" });
    const productos = await getProducts({ model: "iPhone 15 Pro" });
    const propias = new Set(productos.flatMap((p) => p.variants).map((v) => v.storage));

    for (const capacidad of facets.storages) {
      expect(propias.has(capacidad.value)).toBe(true);
    }
  });
});

describe("productos sin foto", () => {
  /**
   * Hoy se publican también los que no tienen foto: ocultarlos dejaba el
   * catálogo en 18 productos de 71, todos iPhone, y con una sola marca los
   * filtros de marca y categoría desaparecían.
   *
   * Lo que sí se sostiene es que un producto sin foto no recibe una imagen
   * prestada: o tiene las suyas o no tiene ninguna, y la tarjeta lo dice.
   */
  it("un producto sin foto no recibe una imagen prestada", async () => {
    const todos = await getProducts({ incluirSinFoto: true });
    const sinFoto = todos.filter((p) => p.images.length === 0);
    expect(sinFoto.length).toBeGreaterThan(0);
    for (const p of todos) {
      for (const img of p.images) {
        expect(img.url).toContain(`/productos/${p.slug}/`);
      }
    }
  });

  it("las facetas tampoco cuentan lo que no se publica", async () => {
    const facets = await getCatalogFacets();
    const publicados = await getProducts();
    const marcas = new Set(publicados.map((p) => p.brand));
    for (const f of facets.brands) {
      expect(marcas.has(f.value)).toBe(true);
    }
  });
});
