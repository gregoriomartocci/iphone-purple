import { describe, expect, it } from "vitest";
import { estadoDelLocal, semana } from "@/lib/horario";

describe("estado del local", () => {
  it("está abierto un martes al mediodía", () => {
    const r = estadoDelLocal(new Date(2026, 8, 1, 12, 0));
    expect(r.abierto).toBe(true);
  });

  it("está cerrado un domingo y avisa cuándo vuelve a abrir", () => {
    const r = estadoDelLocal(new Date(2026, 8, 6, 12, 0));
    expect(r.abierto).toBe(false);
    if (!r.abierto) expect(r.proximo).toContain("10");
  });

  /** El sábado cierra más temprano: a las 15 ya está cerrado. */
  it("el sábado a las 15 está cerrado aunque un jueves a esa hora no", () => {
    const sabado = estadoDelLocal(new Date(2026, 8, 5, 15, 0));
    const jueves = estadoDelLocal(new Date(2026, 8, 3, 15, 0));
    expect(sabado.abierto).toBe(false);
    expect(jueves.abierto).toBe(true);
  });

  it("antes de abrir avisa que abre hoy", () => {
    const r = estadoDelLocal(new Date(2026, 8, 1, 8, 0));
    expect(r.abierto).toBe(false);
    if (!r.abierto) expect(r.proximo).toContain("hoy");
  });

  it("la semana lista los siete días empezando por lunes", () => {
    const s = semana();
    expect(s).toHaveLength(7);
    expect(s[0].dia).toBe("lunes");
    expect(s[6].horario).toBe("Cerrado");
  });
});
