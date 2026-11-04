import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

describe("el costo no llega a la tienda", () => {
  it("las consultas públicas no traen costos", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const { getProducts, getBestsellers } = await import("@/lib/data");

    const productos = [...(await getProducts()), ...(await getBestsellers(3))];

    expect(productos.length).toBeGreaterThan(0);
    expect(productos.flatMap((p) => p.variants).every((v) => v.costUsd === null)).toBe(
      true
    );
    vi.unstubAllEnvs();
  });

  it("el panel sí los recibe", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const { getProductsConCosto } = await import("@/lib/data/admin");

    const variantes = (await getProductsConCosto()).flatMap((p) => p.variants);

    expect(variantes.some((v) => v.costUsd !== null)).toBe(true);
    vi.unstubAllEnvs();
  });
});
