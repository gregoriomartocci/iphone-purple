import { describe, expect, it } from "vitest";
import { modeloCanonico } from "@/lib/whatsapp/nombres";

describe("modeloCanonico", () => {
  it.each([
    ['MacBook Air 13.6" M5', 'MacBook Air 13" M5'],
    ['MacBook Air 13" M5', 'MacBook Air 13" M5'],
    ["Macbook Air 13 M5", 'MacBook Air 13" M5'],
    ['MacBook Air 15.3" M5', 'MacBook Air 15" M5'],
    ['MacBook Pro 14.2" M5 Pro', 'MacBook Pro 14" M5 Pro'],
    ["Galaxy A17", "Samsung Galaxy A17"],
    ["Samsung Galaxy A17 Dual SIM", "Samsung Galaxy A17"],
    ["Galaxy S25 Ultra", "Samsung Galaxy S25 Ultra"],
    ["Samsung Galaxy A57 5G", "Samsung Galaxy A57"],
    ["Galaxy S26 FE", "Samsung Galaxy S26 FE"],
    ["Adaptador de corriente USB-C de 20W", "Cargador Apple USB-C 20W"],
    ["Cargador Apple USB-C 20W", "Cargador Apple USB-C 20W"],
  ])("%s → %s", (entrada, salida) => {
    expect(modeloCanonico(entrada)).toBe(salida);
  });

  it("no une lo que puede ser otro equipo", () => {
    expect(modeloCanonico("Samsung Galaxy A17 5G")).toBe("Samsung Galaxy A17 5G");
    expect(modeloCanonico("iPhone 15 Pro")).toBe("iPhone 15 Pro");
    expect(modeloCanonico('MacBook Air 13" M4')).not.toBe(
      modeloCanonico('MacBook Air 13" M5')
    );
    expect(modeloCanonico('MacBook Air 15" M5')).not.toBe(
      modeloCanonico('MacBook Air 13" M5')
    );
    expect(modeloCanonico('iPad Air 13" M4')).toBe('iPad Air 13" M4');
    expect(modeloCanonico("Motorola Moto G17 Dual SIM")).toBe(
      "Motorola Moto G17 Dual SIM"
    );
  });

  it("da lo mismo aplicarla dos veces", () => {
    const una = modeloCanonico('Macbook Air 13.6" M5');
    expect(modeloCanonico(una)).toBe(una);
  });
});
