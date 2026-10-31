import { describe, expect, it } from "vitest";
import { comparable } from "../scripts/whatsapp/telefono.mjs";
import { telefonoComparable } from "@/lib/whatsapp/sincronizar";

/**
 * El lector corre como proceso aparte, sin TypeScript y con sus propias
 * dependencias, así que no puede importar `telefonoComparable`. Tiene su
 * copia.
 *
 * Este archivo existe para que esa copia no se desincronice. Si se separan,
 * pasa una de dos: el lector rechaza la línea correcta por una diferencia de
 * formato, o —lo grave— acepta una equivocada y se pone a leer conversaciones
 * privadas.
 */
const CASOS = [
  "5492211234567",
  "+54 9 221 123-4567",
  "54 221 123 4567",
  "02211 15 1234567",
  "02215 1234567",
  "5491100000000",
  "1123456789",
  "11 2345-6789",
  "0 221 15 1234567",
  "",
  "1234567",
  "54",
  "549",
  "abc",
];

describe("la normalización del lector y la del sitio", () => {
  it.each(CASOS)("coinciden para %o", (entrada) => {
    expect(comparable(entrada)).toBe(telefonoComparable(entrada));
  });

  it("ninguna de las dos acepta un número sin código de área", () => {
    expect(comparable("1234567")).toBe("");
    expect(telefonoComparable("1234567")).toBe("");
  });

  /*
   * El JID de WhatsApp llega como "5492211234567:12@s.whatsapp.net". El ":12"
   * es el dispositivo, y si no se corta antes de comparar queda pegado al
   * número y ninguna línea coincide nunca. El lector lo corta; esto deja
   * escrito por qué.
   */
  it("el sufijo de dispositivo del JID cambia el resultado si no se corta", () => {
    const crudo = "5492211234567:12@s.whatsapp.net";
    const cortado = crudo.split(":")[0];
    expect(comparable(crudo)).not.toBe(comparable(cortado));
    expect(comparable(cortado)).toBe(comparable("5492211234567"));
  });
});
