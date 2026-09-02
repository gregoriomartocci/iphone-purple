import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ParsedRow } from "@/types";

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
      "Grado. 'sellado' solo para sellados o precintados. 'a-plus' si dicen impecable/como nuevo o batería 95+. 'a' es el caso por defecto de un usado sin detalle. 'b' si mencionan marcas de uso visibles o batería menor a 88."
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

/** Cliente perezoso: si la clave falta, queremos un error claro y no un crash al importar el módulo. */
function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.length < 30) {
    throw new Error(
      "Falta configurar ANTHROPIC_API_KEY para interpretar listas de proveedores."
    );
  }
  if (!cached) cached = new Anthropic({ apiKey });
  return cached;
}

export async function parseSupplierList(rawText: string): Promise<ParsedList> {
  const text = rawText.trim();
  if (!text) return { rows: [], warnings: [] };

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

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error(
      "No se pudo interpretar la lista. Probá pegando menos líneas por vez."
    );
  }

  return { rows: parsed.rows as ParsedRow[], warnings: parsed.warnings };
}

/**
 * Precio de venta a partir del costo.
 *
 * Se redondea hacia arriba a la decena de miles más cercana para que los precios
 * queden en cifras presentables ($1.250.000 y no $1.247.318).
 */
export function sellPrice(
  cost: number,
  currency: "USD" | "ARS",
  marginPct: number,
  dollarRate: number
): { priceArs: number; priceUsd: number; costUsd: number } {
  const costUsd = currency === "USD" ? cost : cost / dollarRate;
  const priceUsd = Math.round(costUsd * (1 + marginPct / 100));
  const rawArs = priceUsd * dollarRate;

  return {
    costUsd: Math.round(costUsd * 100) / 100,
    priceUsd,
    priceArs: Math.ceil(rawArs / 10_000) * 10_000,
  };
}
