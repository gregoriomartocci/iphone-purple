import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductDetail } from "@/components/site/ProductDetail";
import type { Product, Variant } from "@/types";

const variante = (id: string, storage: string, colores: [string, string][]): Variant => ({
  id,
  productId: "p",
  storage,
  color: colores[0]?.[0] ?? "",
  colorHex: colores[0]?.[1] ?? "#cccccc",
  colores: colores.map(([nombre, hex]) => ({ nombre, hex })),
  grade: "sellado",
  authenticity: "original",
  batteryHealth: null,
  priceArs: 2_000_000,
  priceUsd: 1200,
  costUsd: null,
  stock: 1,
  sku: id,
});

const producto = (variants: Variant[]) =>
  ({
    id: "p",
    name: "MacBook Prueba",
    slug: "macbook-prueba",
    brand: "Apple",
    model: "MacBook Prueba",
    category: "notebook",
    description: "",
    specs: {},
    isFeatured: false,
    createdAt: "2026-11-05T00:00:00Z",
    images: [],
    variants,
  }) as unknown as Product;

const ficha = (variants: Variant[]) =>
  render(
    <ProductDetail
      product={producto(variants)}
      whatsappNumber="5492210000000"
      dollarRate={1700}
      dollarRateUpdatedAt="2026-11-05T00:00:00Z"
    />
  );

const mensaje = () =>
  decodeURIComponent(
    screen.getByRole("link", { name: /consultar disponibilidad/i }).getAttribute("href")!
  );

describe("colores en la ficha", () => {
  it("con un solo color, lo muestra y no hay nada para elegir", () => {
    ficha([variante("a", "1TB", [["Space Black", "#2e2c2f"]])]);
    expect(screen.getByText("Color disponible")).toBeInTheDocument();
    expect(screen.getByText("Space Black")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Space Black" })).toBeNull();
    expect(mensaje()).toContain("Space Black");
  });

  it("con varios colores, se elige y el mensaje lleva el elegido", () => {
    ficha([
      variante("a", "512GB", [
        ["Starlight", "#ede6db"],
        ["Sky Blue", "#c7d5e3"],
      ]),
    ]);
    expect(screen.queryByText("Color disponible")).toBeNull();
    expect(mensaje()).toContain("Starlight");
    fireEvent.click(screen.getByRole("button", { name: "Sky Blue" }));
    expect(screen.getByRole("button", { name: "Sky Blue" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(mensaje()).toContain("Sky Blue");
    expect(mensaje()).not.toContain("Starlight");
  });

  it("un color de otra capacidad lleva a esa capacidad, con ese color", () => {
    ficha([
      variante("a", "256GB", [["Silver", "#e3e4e1"]]),
      variante("b", "512GB", [
        ["Silver", "#e3e4e1"],
        ["Burgundy", "#6b2433"],
      ]),
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Burgundy" }));
    expect(mensaje()).toContain("512GB");
    expect(mensaje()).toContain("Burgundy");
  });

  it("sin colores conocidos no muestra la sección", () => {
    ficha([variante("a", "512GB", [])]);
    expect(screen.queryByText(/^Color/)).toBeNull();
    expect(mensaje()).toContain("512GB");
  });
});
