import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ParsedRow } from "@/types";
import { precioArsDesdeUsd } from "@/lib/cotizacion";
import { elegirInterprete, interpretarConSesion } from "./interprete";

/**
 * Interpretación de listas de proveedores.
 *
 * Los proveedores mandan sus listas por WhatsApp en texto libre, cada uno con su
 * formato: abreviaturas, emojis, precios con y sin símbolo, capacidades pegadas al
 * modelo. En vez de mantener expresiones regulares por proveedor, se lo pasamos a
 * Claude con salida estructurada, que devuelve filas tipadas.
 *
 * Nada de lo que sale de acá se publica solo: el panel muestra una vista previa
 * editable y la publicación es un segundo paso explícito.
 */

const RowSchema = z.object({
  brand: z
    .string()
    .describe("Marca. Casi siempre Apple; si no se aclara, deducila del modelo."),
  model: z
    .string()
    .describe(
      "Modelo normalizado y completo, como lo escribiría Apple: 'iPhone 15 Pro Max', no 'ip15pm' ni '15 PM'."
    ),
  storage: z
    .string()
    .describe(
      "Capacidad con unidad, formato '128GB' / '1TB'. Si no figura, poné cadena vacía."
    ),
  color: z
    .string()
    .nullable()
    .describe("Color en español si aparece; null si no se menciona."),
  category: z
    .enum([
      "celular",
      "tablet",
      "notebook",
      "reloj",
      "audio",
      "consola",
      "hogar",
      "accesorio",
    ])
    .describe(
      "Tipo de producto, deducido del modelo. Un iPhone o un Redmi son 'celular'; un iPad o Redmi Pad, 'tablet'; un MacBook, 'notebook'; un Garmin, Kieslect o Apple Watch, 'reloj'; una Switch o PlayStation, 'consola'; un secador Dyson o una aspiradora, 'hogar'; fundas, cargadores, joysticks y SSD, 'accesorio'."
    ),
  grade: z
    .enum(["sellado", "a-plus", "a", "a-minus"])
    .describe(
      "Grado. 'sellado' solo para sellados o precintados. 'a-plus' si dicen impecable/como nuevo o batería 95+. 'a' es el caso por defecto de un usado sin detalle. 'a-minus' si mencionan marcas de uso visibles o batería menor a 88."
    ),
  authenticity: z
    .enum(["original", "replica"])
    .describe(
      "'replica' SOLO si el texto lo indica: réplica, clon, AAA, calidad A, 'estilo', 'tipo'. Ante la duda, 'original'."
    ),
  batteryHealth: z
    .number()
    .int()
    .min(0)
    .max(100)
    .nullable()
    .describe(
      "Salud de batería en porcentaje si la informan (ej: 'bat 89' → 89). null si no."
    ),
  currency: z
    .enum(["USD", "ARS"])
    .describe(
      "Moneda del costo. Las listas mayoristas argentinas suelen ir en USD salvo que digan lo contrario."
    ),
  cost: z
    .number()
    .positive()
    .describe("Costo unitario que cobra el proveedor, solo el número."),
  quantity: z
    .number()
    .int()
    .min(0)
    .describe("Unidades disponibles. Si no lo aclaran, poné 1."),
  notes: z
    .string()
    .nullable()
    .describe(
      "Cualquier detalle relevante que no entre en los otros campos: detalles estéticos, si tiene caja, garantía."
    ),
});

const ListSchema = z.object({
  rows: z.array(RowSchema).describe("Una fila por equipo ofrecido en la lista."),
  warnings: z
    .array(z.string())
    .describe(
      "Líneas que no se pudieron interpretar o que quedaron dudosas, para que la persona las revise a mano."
    ),
});

export type ParsedList = { rows: ParsedRow[]; warnings: string[] };

const SYSTEM_PROMPT = `Interpretás listas de precios que los proveedores mayoristas de celulares en Argentina mandan por WhatsApp.

El texto viene desprolijo: abreviaturas ("ip13", "15 PM", "SE 3"), emojis, líneas de saludo, precios sin símbolo, capacidades pegadas al modelo, estados escritos de mil formas ("impecable", "9 de 10", "usado a nuevo").

Reglas:
- Una fila por equipo concreto ofrecido. Si una línea lista varias capacidades con distintos precios, generá una fila por cada una.
- Normalizá los modelos al nombre comercial completo de Apple.
- No inventes datos. Si un dato no está, usá null (o cadena vacía en storage).
- Ignorá saludos, condiciones de pago, datos de contacto y todo lo que no sea un equipo.
- Si una línea parece un equipo pero no podés extraer modelo o precio con confianza, no la incluyas en rows: describila en warnings.
- Los precios de listas mayoristas argentinas están casi siempre en dólares. Marcá ARS solo si el texto lo indica ("$", "pesos", "ARS") o si el monto es claramente de esa escala.
- Réplicas: marcá 'replica' únicamente cuando el texto lo diga ("réplica", "clon", "AAA", "calidad A", "estilo Apple", "tipo AirPods"). Si no lo aclara, es original. Equivocarse acá tiene consecuencias legales, así que ante la duda va 'original' y la persona lo corrige en la revisión.`;

let cached: Anthropic | null = null;

/** Cliente perezoso: construirlo al importar el módulo haría fallar hasta a quien no interpreta nada. */
function client(): Anthropic {
  if (!cached) cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cached;
}

type Lista = z.infer<typeof ListSchema>;

async function porApi(text: string): Promise<Lista> {
  const response = await client().messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    thinking: { type: "adaptive" },
    output_config: { format: zodOutputFormat(ListSchema) },
    messages: [
      {
        role: "user",
        content: `Interpretá esta lista de proveedor:\n\n<lista>\n${text}\n</lista>`,
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error(
      "No se pudo interpretar la lista. Probá pegando menos líneas por vez."
    );
  }
  return response.parsed_output;
}

/**
 * Valida fila por fila lo que devolvió la sesión.
 *
 * Una fila incompleta queda afuera y se informa como aviso, sin completarla:
 * adivinar una marca o un precio es peor que no publicar ese equipo. Solo se
 * rechaza todo si la respuesta no tiene forma de lista.
 */
export function validarLista(crudo: unknown): Lista {
  const raiz = z
    .object({ rows: z.array(z.unknown()), warnings: z.array(z.string()).default([]) })
    .safeParse(crudo);
  if (!raiz.success) {
    throw new Error(
      "La sesión devolvió una respuesta sin forma de lista. Probá de nuevo, o cargá ANTHROPIC_API_KEY para usar la API."
    );
  }

  const rows: Lista["rows"] = [];
  const warnings = [...raiz.data.warnings];
  for (const fila of raiz.data.rows) {
    const validada = RowSchema.safeParse(fila);
    if (validada.success) {
      rows.push(validada.data);
      continue;
    }
    const modelo = (fila as { model?: unknown } | null)?.model;
    const campo = validada.error.issues[0]?.path.join(".") ?? "?";
    warnings.push(
      `Fila descartada por datos incompletos (${campo}): ${typeof modelo === "string" ? modelo : "sin modelo"}`
    );
  }
  return { rows, warnings };
}

/*
 * El esquema en JSON Schema, que es cómo se le explica la forma a la sesión.
 * `z.toJSONSchema` arrastra los `.describe()` de cada campo, así que las reglas
 * de interpretación —qué es 'replica', cuándo va 'sellado'— viajan iguales por
 * los dos caminos. Se calcula una vez: no cambia entre listas.
 */
let esquemaJson: string | null = null;

/**
 * Por sesión no hay salida estructurada, así que lo que vuelve es texto y hay
 * que validarlo contra el mismo esquema. Esta validación es la que hace que el
 * camino de sesión sea tan confiable como el de API: si el modelo se desvía de
 * la forma, el error aparece acá y no más adelante, con un precio mal cargado.
 */
async function porSesion(binario: string, text: string): Promise<Lista> {
  esquemaJson ??= JSON.stringify(z.toJSONSchema(ListSchema), null, 1);
  const crudo = await interpretarConSesion(binario, SYSTEM_PROMPT, esquemaJson, text);

  return validarLista(crudo);
}

/** Une los mensajes de una tanda. La lista se corta solo acá, nunca a mitad de uno. */
export const SEPARADOR_DE_MENSAJES = "\n\n=== mensaje siguiente ===\n\n";

const MAXIMO_POR_TROZO = 8_000;
const TROZOS_EN_PARALELO = 3;

/**
 * Agrupa los mensajes en trozos de un tamaño que el intérprete resuelve a tiempo.
 *
 * Un mensaje nunca se parte: su encabezado, como "USADOS", define cómo leer sus
 * renglones. Un mensaje enorme queda como un trozo propio.
 */
export function trozosDeLista(texto: string): string[] {
  const trozos: string[] = [];
  let actual = "";
  for (const mensaje of texto.split(SEPARADOR_DE_MENSAJES)) {
    if (actual && actual.length + mensaje.length > MAXIMO_POR_TROZO) {
      trozos.push(actual);
      actual = "";
    }
    actual = actual ? `${actual}\n\n${mensaje}` : mensaje;
  }
  if (actual) trozos.push(actual);
  return trozos;
}

export async function parseSupplierList(rawText: string): Promise<ParsedList> {
  const text = rawText.trim();
  if (!text) return { rows: [], warnings: [] };

  const eleccion = elegirInterprete();
  if (eleccion.modo === null) throw new Error(eleccion.error);

  const trozos = trozosDeLista(text);
  const resultados: Lista[] = [];
  /*
   * Si falla un trozo falla toda la lista. Una lista parcial se leería como que
   * el proveedor dejó de ofrecer lo demás, y eso pasaría a stock cero.
   */
  for (let i = 0; i < trozos.length; i += TROZOS_EN_PARALELO) {
    resultados.push(
      ...(await Promise.all(
        trozos
          .slice(i, i + TROZOS_EN_PARALELO)
          .map((t) =>
            eleccion.modo === "api" ? porApi(t) : porSesion(eleccion.binario, t)
          )
      ))
    );
  }

  return {
    rows: resultados.flatMap((r) => r.rows) as ParsedRow[],
    warnings: resultados.flatMap((r) => r.warnings),
  };
}

/**
 * Precio de venta a partir del costo.
 *
 * El redondeo del precio en pesos vive en `lib/cotizacion.ts`, porque el
 * recálculo diario por cambio de cotización tiene que dar exactamente lo
 * mismo que esto.
 */
export function sellPrice(
  cost: number,
  currency: "USD" | "ARS",
  marginPct: number,
  dollarRate: number
): { priceArs: number; priceUsd: number; costUsd: number } {
  const costUsd = currency === "USD" ? cost : cost / dollarRate;
  const priceUsd = Math.round(costUsd * (1 + marginPct / 100));

  return {
    costUsd: Math.round(costUsd * 100) / 100,
    priceUsd,
    priceArs: precioArsDesdeUsd(priceUsd, dollarRate),
  };
}
