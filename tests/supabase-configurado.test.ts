import { afterEach, describe, expect, it, vi } from "vitest";
import { isSupabaseConfigured } from "@/lib/data";

/**
 * El chequeo que decide si el sitio lee de la base o sirve la semilla.
 *
 * Importa más de lo que parece: cuando devuelve `true` sin que haya base, el
 * cartel de «catálogo de demostración» se apaga —da por hecho que hay datos
 * reales— y la tienda muestra productos inventados sin avisar. Cuando devuelve
 * `false` con la base conectada, el negocio publica la semilla.
 */

const URL_REAL = "https://kwbsgukyjcvqudyehzdl.supabase.co";
const JWT = `eyJ${"x".repeat(60)}`;
const PUBLISHABLE = "sb_publishable_AbC123dEf456GhI789";

function con(url: string, key: string) {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", key);
  return isSupabaseConfigured();
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("isSupabaseConfigured", () => {
  /**
   * El caso que motivó el cambio: las claves nuevas son cortas a propósito, y
   * el chequeo anterior —que medía el largo— rechazaba una clave válida.
   */
  it("acepta la clave publishable nueva, que es corta", () => {
    expect(PUBLISHABLE.length).toBeLessThan(40);
    expect(con(URL_REAL, PUBLISHABLE)).toBe(true);
  });

  it("sigue aceptando la anon key legacy, que es un JWT largo", () => {
    expect(con(URL_REAL, JWT)).toBe(true);
  });

  it("no se conforma con el prefijo solo", () => {
    expect(con(URL_REAL, "sb_publishable_")).toBe(false);
    expect(con(URL_REAL, "sb_publishable_abc")).toBe(false);
  });

  it("rechaza vacío y placeholders", () => {
    expect(con(URL_REAL, "")).toBe(false);
    expect(con(URL_REAL, "tu-clave-acá")).toBe(false);
  });

  it("exige una URL de Supabase, no cualquier https", () => {
    expect(con("https://iphonepurple.com.ar", PUBLISHABLE)).toBe(false);
    expect(con("http://proyecto.supabase.co", PUBLISHABLE)).toBe(false);
    expect(con("", PUBLISHABLE)).toBe(false);
  });

  /**
   * La variable con prefijo NEXT_PUBLIC_ se compila dentro del bundle y viaja
   * al navegador en cada visita. Una clave secreta ahí es la llave maestra de
   * la base repartida a cualquiera que abra el sitio.
   */
  it("rechaza una clave secreta puesta en la variable pública, y avisa", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(con(URL_REAL, "sb_secret_AbC123dEf456GhI789")).toBe(false);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("clave SECRETA"));
  });
});
