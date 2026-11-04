import { describe, expect, it } from "vitest";
import { precioArsDesdeUsd, revisarCotizacion } from "@/lib/cotizacion";

const hoy = () => new Date().toISOString();
const cot = (venta: number, fecha = hoy()) => ({ venta, fecha, fuente: "test" });

describe("precioArsDesdeUsd", () => {
  it("redondea hacia arriba a la decena de miles", () => {
    expect(precioArsDesdeUsd(935, 1565)).toBe(1_470_000);
    expect(precioArsDesdeUsd(1150, 1565)).toBe(1_800_000);
  });

  it("un monto ya redondo no se infla", () => {
    expect(precioArsDesdeUsd(100, 1000)).toBe(100_000);
  });

  /*
   * Es el mismo redondeo que aplica `sellPrice` al publicar. Si dieran
   * distinto, el recálculo diario movería precios sin que cambiara nada más
   * que el redondeo.
   */
  it("es estable: aplicarlo dos veces con la misma cotización no mueve el precio", () => {
    const uno = precioArsDesdeUsd(935, 1565);
    expect(precioArsDesdeUsd(935, 1565)).toBe(uno);
  });
});

describe("revisarCotizacion", () => {
  it("acepta una cotización normal", () => {
    expect(revisarCotizacion(cot(1565), 1450).ok).toBe(true);
  });

  it("acepta sin cotización anterior: no hay con qué comparar", () => {
    expect(revisarCotizacion(cot(1565), null).ok).toBe(true);
  });

  /*
   * El caso que motiva todo esto: una API que devuelve un cero de más. Pasa
   * cualquier chequeo de "¿es un número positivo?" y multiplica por diez el
   * catálogo entero sin que nada se vea roto.
   */
  it("frena un cero de más", () => {
    const r = revisarCotizacion(cot(15_650), 1565);
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.motivo).toBe("salto-grande");
  });

  it("frena un cero de menos", () => {
    const r = revisarCotizacion(cot(156), 1565);
    expect(r.ok).toBe(false);
  });

  it("frena un cero pelado", () => {
    const r = revisarCotizacion(cot(0), 1565);
    expect(r.ok === false && r.motivo).toBe("fuera-de-rango");
  });

  it("frena un NaN", () => {
    const r = revisarCotizacion(cot(Number.NaN), 1565);
    expect(r.ok === false && r.motivo).toBe("fuera-de-rango");
  });

  it("frena una cotización vieja", () => {
    const hace30dias = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const r = revisarCotizacion(cot(1565, hace30dias), 1550);
    expect(r.ok === false && r.motivo).toBe("vieja");
  });

  it("frena una fecha que no se puede leer", () => {
    const r = revisarCotizacion(cot(1565, "ayer a la tarde"), 1550);
    expect(r.ok === false && r.motivo).toBe("vieja");
  });

  it("deja pasar un movimiento diario creíble", () => {
    expect(revisarCotizacion(cot(1640), 1565).ok).toBe(true); // +4.8%
    expect(revisarCotizacion(cot(1490), 1565).ok).toBe(true); // -4.8%
  });

  it("frena justo pasado el límite del 15%", () => {
    expect(revisarCotizacion(cot(1700), 1565).ok).toBe(true); // +8.6%
    expect(revisarCotizacion(cot(1810), 1565).ok).toBe(false); // +15.6%
  });

  it("el detalle dice los dos números, para poder decidir sin buscarlos", () => {
    const r = revisarCotizacion(cot(15_650), 1565);
    expect(r.ok === false && r.detalle).toContain("1565");
    expect(r.ok === false && r.detalle).toContain("15650");
  });
});
