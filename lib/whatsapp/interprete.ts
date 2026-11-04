import { execFile } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const ejecutar = promisify(execFile);

/**
 * Quién interpreta las listas de proveedores: la API de Claude o la sesión
 * local de Claude Code.
 *
 * El camino normal es la API. El de sesión existe para un caso concreto: poder
 * probar el importador en la máquina de uno sin tener una clave de API cargada.
 *
 * No son equivalentes, y la diferencia importa al elegir:
 *
 * - **Costo.** Medido sobre una lista real: la sesión gasta 33.418 tokens de
 *   entrada por lista contra unos 420 de la API. La diferencia no es el prompt,
 *   es el armazón de Claude Code —herramientas, instrucciones, contexto— que se
 *   reconstruye en cada invocación y no se cachea entre una lista y la
 *   siguiente.
 * - **Formato.** La API garantiza la forma de la respuesta con salida
 *   estructurada. La sesión devuelve texto, así que la forma hay que validarla.
 *   Por eso los dos caminos terminan pasando por el mismo `ListSchema`: es lo
 *   que hace que el de sesión sea seguro de usar.
 * - **Dónde corre.** La sesión solo existe en una máquina con Claude Code
 *   instalado y la cuenta vinculada. En el servidor no hay binario ni keychain,
 *   así que la automatización —que es el objetivo— necesita la clave de API. La
 *   sesión no es un reemplazo, es una comodidad para desarrollar.
 */

export type Modo = "api" | "sesion";

export type Eleccion =
  { modo: "api" } | { modo: "sesion"; binario: string } | { modo: null; error: string };

/**
 * Una clave de API plausible.
 *
 * Se mira la forma y no solo el largo, porque el caso que hay que atajar no es
 * una clave corta sino un `.env` con el texto de relleno todavía puesto: eso
 * pasa cualquier chequeo de "¿está definida?" y después falla con un 401 a
 * mitad de una importación.
 */
function claveApiPlausible(): boolean {
  const clave = process.env.ANTHROPIC_API_KEY ?? "";
  return clave.startsWith("sk-ant-") && clave.length >= 40;
}

/**
 * En producción la sesión queda bloqueada a propósito.
 *
 * En Vercel no hay binario de Claude Code ni keychain que leer, así que el
 * camino fallaría igual. El bloqueo explícito está para que falle con un
 * mensaje que explica qué falta, en vez de con el error de un `spawn` que no
 * encontró un ejecutable.
 */
function enProduccion(): boolean {
  return Boolean(process.env.VERCEL);
}

/** Dónde puede estar el ejecutable de Claude Code, de lo más explícito a lo más adivinado. */
function buscarBinario(): string | null {
  const declarado = process.env.CLAUDE_CLI_PATH;
  if (declarado) return existsSync(declarado) ? declarado : null;

  for (const ruta of [
    join(homedir(), ".claude/local/claude"),
    join(homedir(), ".local/bin/claude"),
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
  ]) {
    if (existsSync(ruta)) return ruta;
  }

  /*
   * El binario que trae la extensión de VSCode. La carpeta lleva la versión en
   * el nombre y conviven varias tras cada actualización, así que se ordena al
   * revés y gana la última: apuntar a una vieja funciona hasta que se borra.
   */
  const extensiones = join(homedir(), ".vscode/extensions");
  if (!existsSync(extensiones)) return null;
  const candidatas = readdirSync(extensiones)
    .filter((n) => n.startsWith("anthropic.claude-code-"))
    .sort()
    .reverse();
  for (const carpeta of candidatas) {
    const ruta = join(extensiones, carpeta, "resources/native-binary/claude");
    if (existsSync(ruta)) return ruta;
  }
  return null;
}

/**
 * Qué intérprete usar.
 *
 * `INTERPRETE_LISTAS` fuerza uno de los dos (`api` o `sesion`) y sirve para
 * probar el camino que no se elegiría solo. Sin esa variable decide por lo que
 * hay, prefiriendo la API.
 */
export function elegirInterprete(): Eleccion {
  const forzado = process.env.INTERPRETE_LISTAS;

  if (forzado === "api") {
    if (claveApiPlausible()) return { modo: "api" };
    return {
      modo: null,
      error:
        "INTERPRETE_LISTAS=api pero ANTHROPIC_API_KEY falta o no tiene forma de clave. " +
        "Sacala de console.anthropic.com → API Keys.",
    };
  }

  if (forzado === "sesion") {
    if (enProduccion()) {
      return {
        modo: null,
        error:
          "INTERPRETE_LISTAS=sesion no funciona en producción: no hay sesión de Claude Code " +
          "en el servidor. Cargá ANTHROPIC_API_KEY.",
      };
    }
    const binario = buscarBinario();
    if (binario) return { modo: "sesion", binario };
    return {
      modo: null,
      error:
        "INTERPRETE_LISTAS=sesion pero no encontré el ejecutable de Claude Code. " +
        "Indicá dónde está con CLAUDE_CLI_PATH.",
    };
  }

  if (claveApiPlausible()) return { modo: "api" };

  if (!enProduccion()) {
    const binario = buscarBinario();
    if (binario) return { modo: "sesion", binario };
  }

  return {
    modo: null,
    error:
      "No hay con qué interpretar las listas. Cargá ANTHROPIC_API_KEY " +
      "(console.anthropic.com → API Keys), que es la única opción que funciona " +
      "en el servidor; en tu máquina también sirve tener Claude Code instalado.",
  };
}

/**
 * El JSON que vino envuelto en algo.
 *
 * La API devuelve la estructura garantizada; la sesión devuelve texto, y puede
 * traer el JSON dentro de un bloque de código o con una frase alrededor. En vez
 * de pedir por prompt que no lo haga —que funciona casi siempre, y "casi" acá
 * significa una importación fallada— se busca el objeto y listo.
 */
export function extraerJson(texto: string): unknown {
  const limpio = texto.trim();

  const cercado = limpio.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidatos = [limpio, cercado?.[1]?.trim()].filter(
    (c): c is string => typeof c === "string" && c.length > 0
  );

  const primera = limpio.indexOf("{");
  const ultima = limpio.lastIndexOf("}");
  if (primera !== -1 && ultima > primera) {
    candidatos.push(limpio.slice(primera, ultima + 1));
  }

  for (const candidato of candidatos) {
    try {
      return JSON.parse(candidato);
    } catch {
      continue;
    }
  }
  throw new Error("La respuesta no traía JSON que se pueda leer.");
}

/** Lo que tarda una lista larga, con margen. Sin tope, una sesión colgada cuelga la importación. */
const ESPERA_MS = 180_000;

/**
 * Interpreta con la sesión local, devolviendo el JSON crudo para que lo valide
 * quien llama.
 *
 * Tres cosas que no son obvias:
 *
 * - `cwd` va a un directorio temporal para que la sesión anidada no levante el
 *   `CLAUDE.md` ni la configuración de este repo. Lo que se busca es un
 *   intérprete de listas, no un agente que sepa del proyecto.
 * - Se le saca `ANTHROPIC_API_KEY` del entorno. Si quedara puesta, el binario la
 *   usaría en vez de la sesión, y si es texto de relleno falla con un 401.
 * - Sin herramientas. No tiene nada que leer ni escribir: entra texto, sale
 *   JSON.
 */
export async function interpretarConSesion(
  binario: string,
  systemPrompt: string,
  esquemaJson: string,
  texto: string
): Promise<unknown> {
  const entorno = { ...process.env };
  delete entorno.ANTHROPIC_API_KEY;

  const pedido = [
    "Interpretá esta lista de proveedor y devolvé únicamente un JSON que cumpla este esquema:",
    "",
    esquemaJson,
    "",
    "<lista>",
    texto,
    "</lista>",
  ].join("\n");

  let salida: string;
  try {
    const { stdout } = await ejecutar(
      binario,
      [
        "-p",
        pedido,
        "--system-prompt",
        systemPrompt,
        "--exclude-dynamic-system-prompt-sections",
        "--allowed-tools",
        "",
        "--model",
        "claude-opus-5",
        "--output-format",
        "json",
      ],
      { cwd: tmpdir(), env: entorno, timeout: ESPERA_MS, maxBuffer: 20 * 1024 * 1024 }
    );
    salida = stdout;
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    throw new Error(
      `La sesión de Claude Code no pudo interpretar la lista: ${mensaje}. ` +
        "Si esto se repite, cargá ANTHROPIC_API_KEY y se usa la API."
    );
  }

  /*
   * `--output-format json` envuelve la respuesta en un sobre con metadatos de la
   * corrida; el texto del modelo viene en `result`.
   */
  const sobre = extraerJson(salida) as { result?: unknown; is_error?: boolean };
  if (sobre.is_error || typeof sobre.result !== "string") {
    throw new Error("La sesión de Claude Code devolvió una respuesta inesperada.");
  }
  return extraerJson(sobre.result);
}
