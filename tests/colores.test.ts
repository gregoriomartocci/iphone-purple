import { describe, expect, it } from "vitest";
import {
  colorOficial,
  coloresDe,
  coloresDeFila,
  coloresOficiales,
  colorParaGuardar,
} from "@/lib/colores";

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

describe("varios colores en un mismo equipo", () => {
  const nombres = (c: { nombre: string }[]) => c.map((x) => x.nombre);

  it("separa los colores y usa los nombres oficiales", () => {
    expect(
      nombres(coloresOficiales('MacBook Air 15" M5', "Blue/Mid/Silver/Star"))
    ).toEqual(["Sky Blue", "Midnight", "Silver", "Starlight"]);
    expect(nombres(coloresOficiales("iPhone 18 Pro", "Silver/Burgundy"))).toEqual([
      "Silver",
      "Burgundy",
    ]);
  });

  it("lee lo que guardó sin perder ni duplicar", () => {
    const guardado = colorParaGuardar(
      coloresOficiales('MacBook Air 13" M5', "azul / medianoche / azul")
    );
    expect(guardado.color).toBe("Sky Blue/Midnight");
    expect(nombres(coloresOficiales('MacBook Air 13" M5', guardado.color))).toEqual([
      "Sky Blue",
      "Midnight",
    ]);
  });

  it("sin color conocido no inventa uno", () => {
    expect(coloresOficiales('MacBook Air 13" M5', "Sin especificar")).toEqual([]);
    expect(colorParaGuardar([]).color).toBe("Sin especificar");
  });

  it("saca los colores de las notas, pero solo si son colores", () => {
    expect(
      nombres(
        coloresDeFila(
          'MacBook Air 13" M5',
          null,
          "Sellado, garantía oficial. Colores disponibles: Starlight, Sky Blue. Escala por volumen"
        )
      )
    ).toEqual(["Starlight", "Sky Blue"]);
    expect(
      nombres(coloresDeFila('MacBook Pro 16" M5 Pro', "negro", "Colores: negro / plata"))
    ).toEqual(["Space Black", "Silver"]);
    expect(coloresDeFila('MacBook Air 13" M5', null, "Colores: a confirmar")).toEqual([]);
    expect(coloresDeFila('MacBook Air 13" M5', null, "Teclado inglés")).toEqual([]);
  });

  it("una variante de la semilla tiene su único color", () => {
    expect(coloresDe({ color: "Negro", colorHex: "#000" })).toEqual([
      { nombre: "Negro", hex: "#000" },
    ]);
    expect(coloresDe({ color: "", colorHex: "#ccc" })).toEqual([]);
  });
});
