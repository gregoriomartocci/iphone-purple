import { describe, expect, it } from "vitest";
import { nombreSugerido } from "@/lib/whatsapp/sincronizar";

/**
 * Los encabezados son los de las listas reales que llegan a los grupos, con
 * sus emojis, sus asteriscos y sus letras raras. Inventarlos habría dado una
 * función que funciona contra lo que imaginé y no contra lo que llega.
 */
describe("nombreSugerido, contra encabezados reales", () => {
  it("saca el nombre cuando el proveedor lo pone", () => {
    expect(nombreSugerido("🇺🇸 *PROVE-TECH* 🇦🇷\n_LISTA DE PRECIOS REVENDEDORES_ 💵")).toBe(
      "Prove-Tech"
    );
  });

  /*
   * Este es el que obliga a normalizar: está escrito con los caracteres
   * matemáticos de Unicode para que se vea en negrita, y no tiene una sola
   * letra ASCII. Sin NFKC no coincide con nada.
   */
  it("entiende el encabezado escrito en negrita de Unicode", () => {
    expect(
      nombreSugerido("𝗧𝗘𝗖𝗛𝗗𝗢𝗚_ · 𝗔𝗣𝗣𝗟𝗘 𝗠𝗔𝗬𝗢𝗥𝗜𝗦𝗧𝗔\n_Stock actualizado · 29/10_")
    ).toBe("Techdog");
  });

  /*
   * El caso que importa que falle bien. Sugerir "Listado Usados" o "Lista Vip"
   * como nombre de proveedor es peor que no sugerir nada: alguien lo acepta
   * sin mirar y queda un proveedor llamado así para siempre.
   */
  it.each([
    ["una fecha", "LISTADO USADOS AL  30/10/2026\nIPHONE USADOS 📱"],
    ["un genérico", "*LISTA VIP.*\n\n*Buenos dias!*"],
    ["una categoría", "⌚ APPLE WATCH\n\n• Apple Watch SE 3 40mm GPS"],
    ["otra categoría", "*CÁMARAS DEPORTIVAS*\n🔥*DJI* Osmo Nano 128GB *$399*"],
  ])("devuelve null cuando el encabezado es %s", (_, texto) => {
    expect(nombreSugerido(texto)).toBeNull();
  });

  /*
   * Los tres falsos positivos que aparecieron al medir contra las listas
   * reales. Todos salían de renglones 2 a 4: un color, un renglón de moneda y
   * un saludo. Por eso ahora solo se mira el primero.
   */
  it.each([
    [
      "un color de la segunda línea",
      "⌚ APPLE WATCH\n\n• Apple Watch SE 3 40mm GPS\nMidnight\n💵 USD 315",
    ],
    [
      "un renglón de moneda",
      "LISTADO USADOS AL  30/10/2026\nIPHONE USADOS 📱\n💵 PRECIOS EN USD",
    ],
    ["un saludo", "*LISTA VIP.*\n\n*Buenos dias!*\n*Envio stock actualizado!!*"],
  ])("no inventa un nombre a partir de %s", (_, texto) => {
    expect(nombreSugerido(texto)).toBeNull();
  });

  it("no se cae con vacío ni con null", () => {
    expect(nombreSugerido(null)).toBeNull();
    expect(nombreSugerido("")).toBeNull();
    expect(nombreSugerido("\n\n  \n")).toBeNull();
  });

  it("descarta una línea demasiado larga para ser un nombre", () => {
    expect(
      nombreSugerido("Hola a todos los clientes de la zona sur y alrededores gente")
    ).toBeNull();
  });
});
