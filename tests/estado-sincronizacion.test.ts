import { describe, expect, it } from "vitest";
import {
  armarSincronizacion,
  type ImportacionResumen,
} from "@/lib/whatsapp/estado-sincronizacion";
import type { Supplier } from "@/types";

const prov = (id: string, isActive = true): Supplier => ({
  id,
  name: id,
  phone: null,
  defaultMarginPct: 5,
  isActive,
});
const imp = (
  proveedorId: string,
  fecha: string,
  estado = "approved"
): ImportacionResumen => ({
  proveedorId,
  fecha,
  estado,
  publicados: 1,
});

describe("armarSincronizacion", () => {
  const filas = armarSincronizacion(
    ["aldia", "nueva", "borrador", "nada", "viejo"]
      .map((p) => prov(p))
      .concat(prov("baja", false)),
    [
      imp("aldia", "2026-11-04T10:00:00Z"),
      imp("nueva", "2026-11-03T10:00:00Z"),
      imp("borrador", "2026-11-01T10:00:00Z"),
      imp("borrador", "2026-11-04T10:00:00Z", "draft"),
      imp("viejo", "2026-11-01T10:00:00Z"),
      imp("viejo", "2026-11-04T10:00:00Z", "draft"),
    ],
    new Map([
      ["aldia", "2026-11-04T09:00:00Z"],
      ["nueva", "2026-11-04T09:00:00Z"],
      ["viejo", "2026-11-05T09:00:00Z"],
    ]),
    new Map([["aldia", 12]]),
    new Date("2026-11-05T12:00:00Z")
  );
  const de = (id: string) => filas.find((f) => f.proveedor.id === id)!;

  it("clasifica cada proveedor", () => {
    expect(de("aldia").estado).toBe("al-dia");
    expect(de("nueva").estado).toBe("lista-nueva");
    expect(de("borrador").estado).toBe("borrador");
    expect(de("nada").estado).toBe("sin-listas");
  });

  it("una lista vista después de un borrador pide leer de nuevo", () => {
    expect(de("viejo").estado).toBe("lista-nueva");
  });

  it("compara instantes aunque el formato de la fecha sea distinto", () => {
    const [f] = armarSincronizacion(
      [prov("a")],
      [imp("a", "2026-11-04T11:39:00+00:00", "draft")],
      new Map([["a", "2026-11-04T11:39:00.000Z"]]),
      new Map(),
      new Date("2026-11-05T12:00:00Z")
    );
    expect(f.estado).toBe("borrador");
  });

  it("una lista vieja no figura como novedad", () => {
    const [f] = armarSincronizacion(
      [prov("a")],
      [],
      new Map([["a", "2026-10-10T10:00:00Z"]]),
      new Map(),
      new Date("2026-11-05T12:00:00Z")
    );
    expect(f.estado).toBe("sin-listas");
  });

  it("pone primero lo que requiere atención y saca a los inactivos", () => {
    expect(filas[0].estado).toBe("lista-nueva");
    expect(filas.at(-1)?.estado).toBe("al-dia");
    expect(filas.some((f) => f.proveedor.id === "baja")).toBe(false);
    expect(de("aldia").publicados).toBe(12);
  });
});
