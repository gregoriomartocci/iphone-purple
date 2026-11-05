import { describe, expect, it } from "vitest";
import { colorOficial } from "@/lib/colores";

describe("colorOficial", () => {
  it("usa el nombre oficial de Apple según el modelo", () => {
    expect(colorOficial("iPhone 18 Pro", "Burgundy")?.nombre).toBe("Burgundy");
    expect(colorOficial("iPhone 18 Pro Max", "bordó")?.nombre).toBe("Burgundy");
    expect(colorOficial("iPhone 17 Pro Max", "naranja")?.nombre).toBe("Cosmic Orange");
    expect(colorOficial("iPhone 16 Pro", "titanio desierto")?.nombre).toBe(
      "Desert Titanium"
    );
    expect(colorOficial("iPhone 16 Pro", "Desert")?.nombre).toBe("Desert Titanium");
    expect(colorOficial("iPhone 14 Pro Max", "negro")?.nombre).toBe("Space Black");
    expect(colorOficial('MacBook Air 13" M5', "Mid")?.nombre).toBe("Midnight");
  });

  it("un Pro no cae en la familia del modelo base", () => {
    expect(colorOficial("iPhone 13 Pro Max", "Grafito")?.nombre).toBe("Graphite");
    expect(colorOficial("iPhone 13", "Medianoche")?.nombre).toBe("Midnight");
    expect(colorOficial("iPhone 14", "Starlight")?.nombre).toBe("Starlight");
  });

  it("un mismo color escrito distinto da uno solo", () => {
    const a = colorOficial("iPhone 16", "Negro");
    const b = colorOficial("iPhone 16", "black");
    expect(a).toEqual(b);
  });

  it("cada color de una familia tiene su propia muestra", () => {
    const hex = ["Silver", "Burgundy", "Glacier", "Black"].map(
      (c) => colorOficial("iPhone 18 Pro", c)?.hex
    );
    expect(new Set(hex).size).toBe(4);
  });

  it("lo que no se sabe no es un color", () => {
    expect(colorOficial("iPhone 16", "Sin especificar")).toBeNull();
    expect(colorOficial("iPhone 16", null)).toBeNull();
  });

  it("fuera de Apple usa nombres en español", () => {
    expect(colorOficial("Samsung Galaxy S25 Ultra", "black")?.nombre).toBe("Negro");
    expect(colorOficial("Google Pixel 10 Pro", "Obsidiana")?.nombre).toBe("Obsidiana");
  });
});
