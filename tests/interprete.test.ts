import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { elegirInterprete, extraerJson } from "@/lib/whatsapp/interprete";

/**
 * Las decisiones de este módulo se toman leyendo el entorno, así que los tests
 * lo arman a mano. `CLAUDE_CLI_PATH` sirve de palanca en los dos sentidos: con
 * una ruta que existe hay binario, con una que no existe no hay —y así no
 * depende de si la máquina que corre los tests tiene Claude Code instalado.
 */
const CLAVE_REAL = "sk-ant-api03-" + "x".repeat(40);
const BINARIO_QUE_EXISTE = "tests/interprete.test.ts";
const BINARIO_QUE_NO = "/no/existe/claude";

let original: NodeJS.ProcessEnv;

beforeEach(() => {
  original = process.env;
  process.env = { ...original };
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.INTERPRETE_LISTAS;
  delete process.env.VERCEL;
  process.env.CLAUDE_CLI_PATH = BINARIO_QUE_NO;
});

afterEach(() => {
  process.env = original;
});

describe("elegirInterprete, sin forzar nada", () => {
  it("prefiere la API cuando hay clave", () => {
    process.env.ANTHROPIC_API_KEY = CLAVE_REAL;
    process.env.CLAUDE_CLI_PATH = BINARIO_QUE_EXISTE;
    expect(elegirInterprete()).toEqual({ modo: "api" });
  });

  it("cae a la sesión cuando no hay clave pero sí binario", () => {
    process.env.CLAUDE_CLI_PATH = BINARIO_QUE_EXISTE;
    expect(elegirInterprete()).toEqual({
      modo: "sesion",
      binario: BINARIO_QUE_EXISTE,
    });
  });

  it("sin clave y sin binario, explica que la API es la que funciona en el servidor", () => {
    const r = elegirInterprete();
    expect(r.modo).toBeNull();
    expect(r.modo === null && r.error).toContain("ANTHROPIC_API_KEY");
  });

  /*
   * El caso que motivó el chequeo de forma: el .env de este proyecto tenía
   * 18 caracteres de texto de relleno en ANTHROPIC_API_KEY. Cualquier chequeo
   * de "¿está definida?" la aceptaba y la importación moría con un 401.
   */
  it("no confunde el texto de relleno con una clave", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-pegala-aca";
    process.env.CLAUDE_CLI_PATH = BINARIO_QUE_EXISTE;
    expect(elegirInterprete()).toEqual({
      modo: "sesion",
      binario: BINARIO_QUE_EXISTE,
    });
  });

  it("en producción no ofrece la sesión, aunque el binario esté", () => {
    process.env.VERCEL = "1";
    process.env.CLAUDE_CLI_PATH = BINARIO_QUE_EXISTE;
    const r = elegirInterprete();
    expect(r.modo).toBeNull();
  });
});

describe("elegirInterprete, forzado", () => {
  it("api sin clave falla, y no se escapa por la sesión", () => {
    process.env.INTERPRETE_LISTAS = "api";
    process.env.CLAUDE_CLI_PATH = BINARIO_QUE_EXISTE;
    const r = elegirInterprete();
    expect(r.modo).toBeNull();
    expect(r.modo === null && r.error).toContain("INTERPRETE_LISTAS=api");
  });

  it("sesion con clave usa la sesión igual: para eso se fuerza", () => {
    process.env.INTERPRETE_LISTAS = "sesion";
    process.env.ANTHROPIC_API_KEY = CLAVE_REAL;
    process.env.CLAUDE_CLI_PATH = BINARIO_QUE_EXISTE;
    expect(elegirInterprete()).toEqual({
      modo: "sesion",
      binario: BINARIO_QUE_EXISTE,
    });
  });

  it("sesion en producción dice que ahí no hay sesión", () => {
    process.env.INTERPRETE_LISTAS = "sesion";
    process.env.VERCEL = "1";
    process.env.CLAUDE_CLI_PATH = BINARIO_QUE_EXISTE;
    const r = elegirInterprete();
    expect(r.modo === null && r.error).toContain("producción");
  });

  it("sesion sin binario dice cómo indicar dónde está", () => {
    process.env.INTERPRETE_LISTAS = "sesion";
    const r = elegirInterprete();
    expect(r.modo === null && r.error).toContain("CLAUDE_CLI_PATH");
  });
});

describe("extraerJson", () => {
  it("lee un JSON pelado", () => {
    expect(extraerJson('{"rows":[],"warnings":[]}')).toEqual({
      rows: [],
      warnings: [],
    });
  });

  it("lo saca de un bloque de código", () => {
    expect(extraerJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("lo saca de un bloque sin lenguaje", () => {
    expect(extraerJson('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("lo saca de entre dos frases", () => {
    expect(extraerJson('Acá va la lista:\n{"a":1}\nEspero que sirva.')).toEqual({
      a: 1,
    });
  });

  it("no se queda con un objeto incompleto si hay anidados", () => {
    expect(extraerJson('texto {"a":{"b":2},"c":3} mas texto')).toEqual({
      a: { b: 2 },
      c: 3,
    });
  });

  it("falla con un mensaje legible si no hay JSON", () => {
    expect(() => extraerJson("no puedo interpretar esta lista")).toThrow(
      /JSON que se pueda leer/
    );
  });
});
