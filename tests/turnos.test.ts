import { describe, expect, it } from "vitest";
import {
  DIAS_DE_ANTICIPACION,
  desdeFecha,
  diasDisponibles,
  horariosDe,
  turnoValido,
} from "@/lib/turnos";

describe("turnos para retirar en el local", () => {
  // Un miércoles cualquiera, para que las cuentas sean verificables a mano.
  const miercoles = new Date(2026, 8, 2);

  it("no ofrece turnos antes de los días de anticipación", () => {
    const dias = diasDisponibles(miercoles);
    const primero = desdeFecha(dias[0]);
    const margen = Math.round((primero.getTime() - miercoles.getTime()) / 86_400_000);
    expect(margen).toBeGreaterThanOrEqual(DIAS_DE_ANTICIPACION);
  });

  it("nunca ofrece un domingo, que el local está cerrado", () => {
    for (const dia of diasDisponibles(miercoles)) {
      expect(desdeFecha(dia).getDay()).not.toBe(0);
    }
  });

  it("los sábados cierran más temprano que el resto", () => {
    const sabado = diasDisponibles(miercoles).find((d) => desdeFecha(d).getDay() === 6)!;
    const habil = diasDisponibles(miercoles).find((d) => desdeFecha(d).getDay() === 3)!;
    expect(horariosDe(sabado).length).toBeLessThan(horariosDe(habil).length);
    expect(horariosDe(sabado).at(-1)).toBe("13:00");
  });

  it("todos los horarios ofrecidos caen dentro del horario de atención", () => {
    for (const dia of diasDisponibles(miercoles)) {
      for (const hora of horariosDe(dia)) {
        const h = Number(hora.split(":")[0]);
        expect(h).toBeGreaterThanOrEqual(10);
        expect(h).toBeLessThanOrEqual(18);
      }
    }
  });

  /** El servidor no puede confiar en lo que llega del formulario. */
  it("rechaza un turno fuera de las reglas", () => {
    const valido = diasDisponibles(miercoles)[0];
    expect(turnoValido(valido, "11:00", miercoles)).toBe(true);
    expect(turnoValido(valido, "23:00", miercoles)).toBe(false);
    expect(turnoValido("2026-09-03", "11:00", miercoles)).toBe(false);
  });

  it("interpreta las fechas en horario local y no se corre de día", () => {
    const d = desdeFecha("2026-09-02");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(2);
  });
});
