import type { ParsedRow, Supplier } from "@/types";

/**
 * Las decisiones que hay que tomar para publicar solo una lista de WhatsApp.
 *
 * Todo lo de acá es función pura: entra texto y datos, sale una decisión. No
 * habla con WhatsApp, ni con Supabase, ni con Claude. Es a propósito —es la
 * parte que puede equivocarse en silencio y publicar un precio mal en la
 * tienda, así que tiene que poder probarse sin levantar nada.
 */

/** Un mensaje tal como lo entrega el servidor de WhatsApp. */
export interface MensajeWhatsapp {
  fecha: string;
  /** `true` si lo mandamos nosotros. Esos nunca son listas de proveedor. */
  mio: boolean;
  texto: string;
}

/** Un chat tal como lo entrega el servidor de WhatsApp. */
export interface ChatWhatsapp {
  jid: string;
  nombre: string | null;
  telefono: string;
  grupo: boolean;
  mensajes: MensajeWhatsapp[];
}

/**
 * Un teléfono reducido a lo que no cambia nunca.
 *
 * El mismo número se escribe de muchas formas: WhatsApp lo entrega como
 * `5492211234567`, el proveedor lo dicta como `221 123-4567`, y en la agenda
 * quedó guardado como `0221 15 1234567`.
 *
 * Quedarse con los últimos dígitos no alcanza, y acá está el motivo: el 54 de
 * país, el 9 de celular y el 0 nacional van todos adelante y se podan solos,
 * pero **el 15 va en el medio**, entre el código de área y el abonado. Un
 * sufijo lo agarra y el número deja de emparejar con el mismo número escrito
 * sin 15. Así que los prefijos se sacan en orden y el 15 aparte, y recién
 * después se compara.
 *
 * El 9 se saca solo si venía detrás del 54, que es donde el formato
 * internacional lo pone. Suelto podría ser el primer dígito de un número real.
 *
 * Un número sin código de área no se puede comparar y devuelve cadena vacía: el
 * mismo abonado existe en muchas ciudades, y emparejarlo sería mandarle la
 * lista de un proveedor a otro.
 */
export function telefonoComparable(valor: string | null | undefined): string {
  let d = (valor ?? "").replace(/\D/g, "");

  if (d.startsWith("54")) {
    d = d.slice(2);
    if (d.startsWith("9")) d = d.slice(1);
  }
  if (d.startsWith("0")) d = d.slice(1);

  // Área (2 a 4 dígitos) + 15 + abonado (6 a 8). Solo se saca cuando lo que
  // queda a los costados tiene forma de número, para no mutilar uno que
  // casualmente contenga un 15.
  d = d.replace(/^(\d{2,4})15(\d{6,8})$/, "$1$2");

  // Sin área no hay con qué desambiguar.
  if (d.length < 9) return "";

  return d.slice(-8);
}

/**
 * Qué proveedor es este chat, si es alguno.
 *
 * Los grupos quedan afuera: una lista reenviada a un grupo de revendedores no
 * es la lista que ese proveedor nos pasa a nosotros, y el precio suele ser
 * otro. Los proveedores inactivos también, porque dejaron de serlo por algo.
 */
export function proveedorDelChat(
  chat: ChatWhatsapp,
  proveedores: Supplier[]
): Supplier | null {
  if (chat.grupo) return null;

  const buscado = telefonoComparable(chat.telefono);
  if (buscado.length < 6) return null;

  return (
    proveedores.find((p) => p.isActive && telefonoComparable(p.phone) === buscado) ?? null
  );
}

/**
 * Si el mensaje tiene pinta de lista de precios.
 *
 * Es un filtro barato puesto antes del caro: sin esto, cada "buen día, mañana
 * te paso la lista" se le manda a Claude y se paga por descubrir que no era
 * nada. Pide tres renglones con un número de más de dos cifras, que es la
 * forma mínima que tiene una lista y que no tiene ninguna charla.
 *
 * Es deliberadamente generoso: dejar pasar un mensaje que no era lista cuesta
 * una llamada a la API, y el parser lo descarta devolviendo cero filas.
 * Frenar una lista de verdad cuesta que el catálogo quede viejo sin que nadie
 * se entere, que es mucho peor.
 */
export function pareceLista(texto: string): boolean {
  const renglones = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const conPrecio = renglones.filter((l) => /\d{3,}/.test(l));
  return conPrecio.length >= 3;
}

/**
 * La lista más nueva de este chat que todavía no importamos.
 *
 * Vale la última y nada más: cuando el proveedor manda una lista corregida
 * media hora después, la que cuenta es la segunda. Por eso se recorre de atrás
 * para adelante y se devuelve la primera que sirve.
 */
export function listaPendiente(
  mensajes: MensajeWhatsapp[],
  ultimaImportacion: string | null
): MensajeWhatsapp | null {
  const corte = ultimaImportacion ? new Date(ultimaImportacion).getTime() : 0;

  const candidatas = mensajes
    .filter((m) => !m.mio)
    .filter((m) => new Date(m.fecha).getTime() > corte)
    .filter((m) => pareceLista(m.texto))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return candidatas.at(-1) ?? null;
}

/**
 * Cómo se identifica un equipo entre listas y entre proveedores.
 *
 * El color queda afuera a propósito. Un proveedor escribe "negro", otro
 * "midnight" y un tercero no lo aclara; si entrara en la clave, el mismo
 * equipo se contaría tres veces y competiría consigo mismo por el precio.
 */
export function claveEquipo(fila: ParsedRow): string {
  return [
    fila.model.trim().toLowerCase(),
    fila.storage.trim().toLowerCase(),
    fila.grade,
    fila.authenticity,
  ].join("|");
}

/**
 * Con qué proveedor nos quedamos cuando varios ofrecen lo mismo.
 *
 * Gana el costo más bajo, que es el que deja más margen con el mismo precio
 * de venta. Se compara solo dentro de la misma moneda: mezclar un costo en
 * dólares con uno en pesos daría siempre ganador al de dólares por ser un
 * número más chico, que es exactamente al revés.
 */
export function mejorPorEquipo(filas: ParsedRow[]): ParsedRow[] {
  const mejores = new Map<string, ParsedRow>();

  for (const fila of filas) {
    const clave = `${claveEquipo(fila)}|${fila.currency}`;
    const actual = mejores.get(clave);
    if (!actual || fila.cost < actual.cost) mejores.set(clave, fila);
  }

  return [...mejores.values()];
}

/** Por qué una lista quedó frenada esperando que alguien la mire. */
export type MotivoRevision = "lista-corta" | "salto-de-precio";

export interface Revision {
  motivo: MotivoRevision;
  detalle: string;
}

/**
 * Cuánto se puede encoger una lista antes de que deje de ser creíble.
 *
 * Un proveedor que mandaba cuarenta modelos y hoy manda cinco casi siempre
 * está contestando algo puntual —"de los 15 Pro me queda esto"—, no pasando
 * su lista completa. Publicar eso como si fuera todo pone en cero el stock
 * de treinta y cinco equipos que sí tiene.
 */
const PROPORCION_MINIMA = 0.5;

/** Mínimo de filas previas para que la proporción signifique algo. */
const MINIMO_PARA_COMPARAR = 8;

/**
 * Cuánto puede moverse un costo de una lista a la otra sin despertar
 * sospechas. Un equipo que baja a menos de la mitad o se duplica casi siempre
 * es un dígito de más o de menos al tipearlo.
 */
const SALTO_MAXIMO = 2;

/**
 * Si esta lista se puede publicar sola o tiene que esperar a una persona.
 *
 * Devuelve la lista de motivos: vacía quiere decir que se publica. No corta
 * en el primero porque el panel los muestra todos juntos, y saber que la
 * lista es corta *y además* tiene un precio raro cambia qué tan rápido hay
 * que ir a mirarla.
 */
export function revisarAntesDePublicar(
  filasNuevas: ParsedRow[],
  filasAnteriores: ParsedRow[]
): Revision[] {
  const avisos: Revision[] = [];

  if (
    filasAnteriores.length >= MINIMO_PARA_COMPARAR &&
    filasNuevas.length < filasAnteriores.length * PROPORCION_MINIMA
  ) {
    avisos.push({
      motivo: "lista-corta",
      detalle: `La lista trae ${filasNuevas.length} equipos y la anterior tenía ${filasAnteriores.length}. Puede ser una respuesta puntual y no la lista completa.`,
    });
  }

  const antes = new Map(
    filasAnteriores.map((f) => [`${claveEquipo(f)}|${f.currency}`, f.cost])
  );

  for (const fila of filasNuevas) {
    const costoPrevio = antes.get(`${claveEquipo(fila)}|${fila.currency}`);
    if (!costoPrevio || costoPrevio <= 0 || fila.cost <= 0) continue;

    const razon = fila.cost / costoPrevio;
    if (razon >= SALTO_MAXIMO || razon <= 1 / SALTO_MAXIMO) {
      avisos.push({
        motivo: "salto-de-precio",
        detalle: `${fila.model} ${fila.storage} pasó de ${costoPrevio} a ${fila.cost} ${fila.currency}.`,
      });
    }
  }

  return avisos;
}

/**
 * Qué equipos de la lista anterior ya no están en la nueva.
 *
 * No se borran: se les pone el stock en cero. La ficha, las fotos y la
 * descripción quedan en la base esperando, y el día que el proveedor lo
 * vuelve a ofrecer el equipo reaparece sin que nadie lo cargue de nuevo.
 */
export function equiposSinStock(
  filasNuevas: ParsedRow[],
  filasAnteriores: ParsedRow[]
): string[] {
  const vigentes = new Set(filasNuevas.map(claveEquipo));
  return [...new Set(filasAnteriores.map(claveEquipo))].filter(
    (clave) => !vigentes.has(clave)
  );
}
