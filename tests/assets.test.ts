import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { versionado } from "@/lib/assets";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";

/**
 * Que toda ruta versionada esté permitida en next.config.
 *
 * next/image rechaza un src local con query salvo que `images.localPatterns`
 * lo habilite, y al declarar esa lista todo lo que no figure queda cerrado.
 * Cuando se empezó a versionar las fotos sueltas de public/ —hero y la banda
 * del canje— la lista solo contemplaba /productos/**, así que la portada se
 * quedó sin fondo: el HTML cargaba, pero el optimizador devolvía 400 para
 * cada foto. En desarrollo directamente reventaba la página.
 *
 * Es un error fácil de repetir, porque no lo atrapa ni el typecheck ni el
 * build: se ve recién al pedir la imagen. Este test lo vuelve barato.
 */

type Patron = { pathname: string; search?: string };
const patrones = (nextConfig.images?.localPatterns ?? []) as Patron[];

/** El mismo emparejado que hace Next: ** cubre cualquier cosa, * un tramo. */
function coincide(patron: Patron, ruta: string, query: string): boolean {
  if (patron.search !== undefined && patron.search !== query) return false;
  const re = new RegExp(
    "^" +
      patron.pathname
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*\*/g, "\u0000")
        .replace(/\*/g, "[^/]*")
        .replace(/\u0000/g, ".*") +
      "$"
  );
  return re.test(ruta);
}

function permitida(url: string): boolean {
  const [ruta, query = ""] = url.split("?");
  return patrones.some((p) => coincide(p, ruta, query));
}

describe("rutas de imagen contra localPatterns", () => {
  it("cada archivo suelto de public/ que se versiona está permitido", () => {
    // Lo que se versiona hoy: las fotos del hero, las bandas de sección y
    // la del canje.
    const sueltos = [
      ...readdirSync(path.join(process.cwd(), "public", "hero")).map((f) => `hero/${f}`),
      ...readdirSync(path.join(process.cwd(), "public", "bandas")).map(
        (f) => `bandas/${f}`
      ),
      "plan-canje.jpg",
    ];
    const rechazadas = sueltos.map((f) => versionado(f)).filter((url) => !permitida(url));
    expect(rechazadas).toEqual([]);
  });

  it("las fotos del catálogo, que ya venían versionadas, siguen permitidas", () => {
    const rechazadas = Object.values(FOTOS_PRODUCTO)
      .flat()
      .filter((f) => !f.video)
      .map((f) => f.url)
      .filter((url) => !permitida(url));
    expect(rechazadas).toEqual([]);
  });

  it("una ruta cualquiera sin query se sigue permitiendo", () => {
    expect(permitida("/logo.svg")).toBe(true);
  });

  /**
   * La contracara: el comodín final no puede aceptar query. Si alguien le
   * saca el `search: ""`, cualquiera podría pedirle al optimizador URLs
   * arbitrarias, que es de lo que la lista protege.
   */
  it("una ruta no declarada con query queda rechazada", () => {
    expect(permitida("/logo.svg?v=abc123")).toBe(false);
  });
});
