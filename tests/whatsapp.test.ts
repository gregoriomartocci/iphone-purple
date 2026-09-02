import { describe, expect, it } from "vitest";
import { waLink, productMessage, repairMessage, tradeInMessage } from "@/lib/whatsapp";

/**
 * Links de WhatsApp.
 *
 * Es la única vía de conversión del sitio: si el link sale mal, no se pierde
 * "una feature", se pierde la venta. Por eso se testea el armado del número y el
 * escapado del mensaje.
 */

describe("waLink", () => {
  it("saca todo lo que no sea dígito del número", () => {
    expect(waLink("+54 9 11 0000-0000")).toBe("https://wa.me/5491100000000");
  });

  it("acepta un número ya normalizado", () => {
    expect(waLink("5491100000000")).toBe("https://wa.me/5491100000000");
  });

  it("sin mensaje no agrega query string", () => {
    expect(waLink("5491100000000")).not.toContain("?");
  });

  it("escapa el mensaje para que sobreviva a la URL", () => {
    const link = waLink("5491100000000", "Hola ¿cómo va? 100% & listo");
    expect(link).toContain("?text=");
    // Ni espacios ni & crudos: romperían el parámetro.
    expect(link.split("?text=")[1]).not.toMatch(/[ &]/);
    expect(decodeURIComponent(link.split("?text=")[1])).toBe(
      "Hola ¿cómo va? 100% & listo"
    );
  });

  it("preserva los saltos de línea del mensaje", () => {
    const link = waLink("5491100000000", "línea uno\nlínea dos");
    expect(decodeURIComponent(link.split("?text=")[1])).toContain("\n");
  });
});

describe("mensajes precargados", () => {
  it("el de producto incluye la variante cuando se le pasa", () => {
    const msg = productMessage("iPhone 15 Pro", "256GB · Titanio Negro");
    expect(msg).toContain("iPhone 15 Pro");
    expect(msg).toContain("256GB · Titanio Negro");
  });

  it("el de producto funciona sin variante", () => {
    const msg = productMessage("iPhone 15 Pro");
    expect(msg).toContain("iPhone 15 Pro");
    expect(msg).not.toContain("(");
  });

  it("el de reparación menciona el equipo si se conoce", () => {
    expect(repairMessage("Cambio de batería", "iPhone 13")).toContain("iPhone 13");
    expect(repairMessage("Cambio de batería")).not.toContain("undefined");
  });

  it("el de canje lleva equipo, estado y estimado", () => {
    const msg = tradeInMessage("Apple iPhone 14 128GB", "Muy bueno", "$600.000");
    expect(msg).toContain("Apple iPhone 14 128GB");
    expect(msg).toContain("Muy bueno");
    expect(msg).toContain("$600.000");
  });

  it("el de canje suma el equipo deseado solo si se eligió", () => {
    const con = tradeInMessage("iPhone 14", "Muy bueno", "$600.000", "iPhone 16 128GB");
    const sin = tradeInMessage("iPhone 14", "Muy bueno", "$600.000");
    expect(con).toContain("iPhone 16 128GB");
    expect(sin).not.toContain("Me interesa llevarme");
  });

  it("ningún mensaje deja un undefined a la vista", () => {
    const todos = [
      productMessage("iPhone 15"),
      repairMessage("Cambio de pantalla"),
      tradeInMessage("iPhone 13", "Bueno", "$300.000"),
    ];
    for (const msg of todos) {
      expect(msg).not.toContain("undefined");
      expect(msg).not.toContain("null");
    }
  });
});
