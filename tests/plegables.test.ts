import { describe, expect, it } from "vitest";
import { alternar, estaAbierta, type Plegadas } from "@/lib/plegables";

describe("secciones plegables del filtro", () => {
  it("arranca abierta si todavía no hay nada elegido", () => {
    expect(estaAbierta({}, "marca", false)).toBe(true);
  });

  it("arranca cerrada si ya hay algo elegido", () => {
    expect(estaAbierta({}, "marca", true)).toBe(false);
  });

  /** El bug: el primer clic guardaba el estado en el que ya estaba. */
  it("un solo clic alcanza para cerrar una sección sin elección", () => {
    const despues = alternar({}, "marca", false);
    expect(estaAbierta(despues, "marca", false)).toBe(false);
  });

  it("un solo clic alcanza para abrir una sección con elección", () => {
    const despues = alternar({}, "marca", true);
    expect(estaAbierta(despues, "marca", true)).toBe(true);
  });

  it("alternar dos veces vuelve al estado original, con o sin elección", () => {
    for (const tieneValor of [false, true]) {
      let p: Plegadas = {};
      const inicial = estaAbierta(p, "x", tieneValor);
      p = alternar(p, "x", tieneValor);
      p = alternar(p, "x", tieneValor);
      expect(estaAbierta(p, "x", tieneValor)).toBe(inicial);
    }
  });

  it("cada sección se alterna sin afectar a las otras", () => {
    let p: Plegadas = {};
    p = alternar(p, "marca", false);
    expect(estaAbierta(p, "marca", false)).toBe(false);
    expect(estaAbierta(p, "color", false)).toBe(true);
  });
});
