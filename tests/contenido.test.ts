import { describe, expect, it } from "vitest";
import { armarPlan } from "@/lib/contenido";
import type { Product } from "@/types";

function producto(
  name: string,
  grade: "sellado" | "a",
  priceArs: number,
  foto = true,
  stock = 1
): Product {
  return {
    id: name,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    images: foto ? [{ url: `/productos/${name}/1.jpg`, alt: name }] : [],
    variants: [
      {
        id: `${name}-v`,
        storage: "256GB",
        grade,
        batteryHealth: grade === "a" ? 90 : null,
        priceArs,
        priceUsd: Math.round(priceArs / 1600),
        stock,
      },
    ],
  } as unknown as Product;
}

const negocio = {
  address: "Gonnet",
  hours: "L a V 9 a 18",
  whatsappDisplay: "221 571-3416",
  instagram: "iphonepurple.ar",
};
const catalogo = [
  producto("iPhone 18 Pro", "sellado", 2_500_000),
  producto("iPhone 16", "sellado", 1_400_000),
  producto("iPhone 15", "a", 800_000),
  producto("AirPods 4", "sellado", 200_000),
  producto("iPhone 17", "sellado", 1_600_000, false),
  producto("iPhone 14", "a", 600_000, true, 0),
];

describe("armarPlan", () => {
  const plan = armarPlan(catalogo, negocio, new Date("2026-11-09T12:00:00Z"));

  it("arma 7 días con tres historias cada uno, empezando por el día pedido", () => {
    expect(plan).toHaveLength(7);
    expect(plan[0].tema).toMatch(/^Lunes/);
    for (const dia of plan) expect(dia.historias).toHaveLength(3);
  });

  it("solo usa productos con foto y con stock", () => {
    const usados = plan.flatMap((d) =>
      d.historias.flatMap((h) => (h.producto ? [h.producto.nombre] : []))
    );
    expect(usados.length).toBeGreaterThan(0);
    expect(usados).not.toContain("iPhone 17");
    expect(usados).not.toContain("iPhone 14");
  });

  it("el precio del finde es el sellado más barato", () => {
    const viernes = plan.find((d) => d.tema.startsWith("Viernes"))!;
    expect(viernes.historias[0].producto?.nombre).toBe("iPhone 16");
  });

  it("sin productos igual arma el plan, sin tarjetas", () => {
    const vacio = armarPlan([], negocio, new Date("2026-11-09T12:00:00Z"));
    expect(vacio).toHaveLength(7);
    expect(vacio.every((d) => d.historias.every((h) => h.producto === null))).toBe(true);
  });
});
