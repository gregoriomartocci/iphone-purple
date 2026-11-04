import type { ParsedRow, Supplier } from "@/types";
import { slugify } from "@/utils/format";

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
  /**
   * Teléfono de quien lo escribió. En un chat de a dos es el del chat; en un
   * grupo es el del participante, que es el dato que importa: en el mismo
   * grupo de revendedores publican varios proveedores distintos.
   */
  autor: string | null;
  /** Cómo aparece esa persona en WhatsApp. Solo para mostrarlo en el panel. */
  autorNombre?: string | null;
}

/** Un chat tal como lo entrega el servidor de WhatsApp. */
export interface ChatWhatsapp {
  jid: string;
  nombre: string | null;
  telefono: string;
  grupo: boolean;
  /** Solo escriben los administradores: todo lo que aparece es del dueño del grupo. */
  soloAdmins?: boolean;
  /** Es el grupo "Avisos" de una comunidad. */
  avisos?: boolean;
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

  /*
   * Área (2 a 4 dígitos) + 15 + abonado (6 a 8), el formato viejo de los
   * celulares argentinos.
   *
   * La condición de los 12 dígitos no es cosmética: un número nacional tiene
   * 10, así que solo tiene sentido sacar el 15 cuando quedan 10. Sin esa
   * condición, un número que casualmente contiene un 15 se mutila. Pasó con
   * una línea real de La Plata: 221 571-3416 queda como "2215713416", que se
   * puede leer como 22|15|713416, y la función devolvía cadena vacía. Un
   * número que no normaliza no empareja con nada, y donde se usa para
   * verificar identidad apaga la verificación entera.
   */
  if (d.length === 12) {
    d = d.replace(/^(\d{2,4})15(\d{6,8})$/, "$1$2");
  }

  // Sin área no hay con qué desambiguar.
  if (d.length < 9) return "";

  return d.slice(-8);
}

/**
 * De qué proveedor es esta lista, si es de alguno.
 *
 * Se mira quién escribió, no en qué chat apareció. La diferencia solo importa
 * en los grupos, y ahí lo cambia todo: en un grupo de revendedores publican
 * varios proveedores, cada uno con su precio y su margen. Mirar el chat los
 * haría a todos "el grupo" y les aplicaría el mismo margen a precios que no
 * tienen nada que ver.
 *
 * Las listas de difusión no necesitan nada especial: WhatsApp las entrega
 * como un mensaje normal de quien las mandó.
 *
 * Un proveedor que escribe en un grupo y también por privado es el mismo: se
 * empareja por teléfono, así que sus dos listas se unifican solas.
 */
export function proveedorDelMensaje(
  chat: ChatWhatsapp,
  mensaje: MensajeWhatsapp,
  proveedores: Supplier[]
): Supplier | null {
  // En un grupo el chat es el grupo: el único dato útil es el autor.
  const telefono = chat.grupo ? mensaje.autor : (mensaje.autor ?? chat.telefono);
  const buscado = telefonoComparable(telefono);
  const porTelefono = buscado
    ? proveedores.find((p) => p.isActive && telefonoComparable(p.phone) === buscado)
    : null;

  return porTelefono ?? proveedorDelGrupo(chat, proveedores);
}

function nombreComparable(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * En una comunidad los mensajes vienen firmados con un identificador interno,
 * que no coincide con el teléfono del proveedor. Pero en un grupo donde solo
 * escriben los administradores, todo es del dueño, así que alcanza con que el
 * nombre del grupo contenga el del proveedor.
 *
 * Nunca en un grupo abierto: ahí publican varios y sería atribuirle a uno la
 * lista de otro.
 */
export function proveedorDelGrupo(
  chat: ChatWhatsapp,
  proveedores: Supplier[]
): Supplier | null {
  if (!chat.grupo || !chat.soloAdmins || !chat.nombre) return null;
  const grupo = nombreComparable(chat.nombre);
  const candidatos = proveedores
    .filter((p) => p.isActive && nombreComparable(p.name).length >= 4)
    .filter((p) => grupo.includes(nombreComparable(p.name)))
    .sort((a, b) => b.name.length - a.name.length);
  return candidatos[0] ?? null;
}

/** Rearma los chats a partir del histórico, que guarda cada mensaje por separado. */
export function chatsDesdeHistorico(
  filas: {
    jid: string;
    chat: string | null;
    fecha: string;
    autor: string | null;
    texto: string;
  }[],
  grupos: { jid: string; nombre: string | null; avisos: boolean; soloAdmins: boolean }[]
): ChatWhatsapp[] {
  const chats = new Map<string, ChatWhatsapp>();
  for (const f of filas) {
    let chat = chats.get(f.jid);
    if (!chat) {
      const grupo = grupos.find((g) => g.jid === f.jid);
      chat = {
        jid: f.jid,
        nombre: grupo?.nombre ?? f.chat,
        telefono: f.jid.split("@")[0],
        grupo: f.jid.endsWith("@g.us"),
        soloAdmins: grupo?.soloAdmins ?? false,
        avisos: grupo?.avisos ?? false,
        mensajes: [],
      };
      chats.set(f.jid, chat);
    }
    chat.mensajes.push({ fecha: f.fecha, mio: false, texto: f.texto, autor: f.autor });
  }
  return [...chats.values()];
}

/** La última lista que se ve de un proveedor en sus chats, y dónde está. */
export interface ListaVista {
  fecha: string;
  chat: string;
  comunidad: boolean;
}

export function ultimasListasVistas(
  chats: ChatWhatsapp[],
  proveedores: Supplier[]
): Record<string, ListaVista> {
  const vistas: Record<string, ListaVista> = {};
  for (const chat of chats) {
    for (const mensaje of chat.mensajes) {
      if (mensaje.mio || !pareceLista(mensaje.texto)) continue;
      const proveedor = proveedorDelMensaje(chat, mensaje, proveedores);
      if (!proveedor) continue;
      const actual = vistas[proveedor.id];
      if (!actual || mensaje.fecha > actual.fecha) {
        vistas[proveedor.id] = {
          fecha: mensaje.fecha,
          chat: chat.avisos ? `Avisos de ${chat.nombre}` : (chat.nombre ?? "su chat"),
          comunidad: Boolean(chat.avisos),
        };
      }
    }
  }
  return vistas;
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
/** Más separados que esto, dos mensajes ya no son parte de la misma tanda. */
const SEPARACION_DE_TANDA_MS = 3 * 3_600_000;

/**
 * Los mensajes que forman la lista más nueva de un proveedor.
 *
 * Muchos publican por partes: Fany manda ocho o nueve mensajes por categoría en
 * el mismo minuto, e iCell tres en media hora. Tomar solo el último dejaba el
 * catálogo con una categoría y el resto en stock cero.
 */
export function tandaPendiente(
  mensajes: MensajeWhatsapp[],
  ultimaImportacion: string | null
): MensajeWhatsapp[] {
  const corte = ultimaImportacion ? new Date(ultimaImportacion).getTime() : 0;
  const candidatas = mensajes
    .filter((m) => !m.mio && pareceLista(m.texto))
    .filter((m) => new Date(m.fecha).getTime() > corte)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const tanda: MensajeWhatsapp[] = [];
  for (const mensaje of candidatas.reverse()) {
    const siguiente = tanda[0];
    if (
      siguiente &&
      new Date(siguiente.fecha).getTime() - new Date(mensaje.fecha).getTime() >
        SEPARACION_DE_TANDA_MS
    ) {
      break;
    }
    tanda.unshift(mensaje);
  }
  return tanda;
}

/**
 * Un proveedor que repite un equipo en la misma tanda lo está corrigiendo, así
 * que vale su última mención aunque el precio anterior fuera más bajo.
 */
export function ultimaPorEquipo(filas: ParsedRow[]): ParsedRow[] {
  const porClave = new Map<string, ParsedRow>();
  for (const fila of filas) porClave.set(`${claveEquipo(fila)}|${fila.currency}`, fila);
  return [...porClave.values()];
}

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
 * El SKU que identifica una variante. Tiene que dar igual entre importaciones.
 *
 * Lleva la autenticidad porque si no, una réplica y un original del mismo
 * modelo, capacidad y grado comparten SKU, y al publicar uno pisa al otro: se
 * actualiza la fila equivocada y un equipo original queda con el precio —y la
 * marca— de una réplica. El sufijo va solo en las réplicas para que el SKU de
 * un original siga siendo el corto y legible de siempre.
 *
 * Es también lo que hace que esto coincida con `claveEquipo` de
 * `sincronizar.ts`, que sí distingue por autenticidad. Sin eso, el cálculo de
 * qué quedó sin stock apuntaba a una variante distinta de la que había
 * publicado.
 */
export function skuDe(row: ParsedRow): string {
  /* La capacidad va en mayúsculas sí o sí. `claveEquipo` la pasa a minúsculas,
     así que sin normalizar acá "256GB" y "256gb" eran SKUs distintos y poner en
     cero el stock apuntaba a una variante que no existía: no fallaba, no
     actualizaba nada. */
  const capacidad = (row.storage || "NA").trim().toUpperCase();
  const base = `${slugify(row.model).toUpperCase()}-${capacidad}-${row.grade}`;
  return row.authenticity === "replica" ? `${base}-REPLICA` : base;
}

/**
 * El mismo SKU, pero a partir de la clave que usa `claveEquipo`.
 *
 * Existe para poner en cero el stock de lo que un proveedor dejó de ofrecer:
 * ahí no hay una fila, hay una clave de algo que ya no está.
 */
export function skuDesdeClave(clave: string): string {
  const [model, storage, grade, authenticity] = clave.split("|");
  return skuDe({
    model,
    storage,
    grade,
    authenticity,
  } as unknown as ParsedRow);
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
  return mejorPorEquipoCon(filas, (f) => f);
}

/**
 * La misma elección, cuando lo que se compara trae algo más pegado.
 *
 * Al cruzar proveedores hace falta saber de quién era la fila que ganó —es
 * quien define el margen—, y una fila sola no lo dice. En vez de repetir la
 * regla del costo más bajo en dos lugares, que es como terminan difiriendo,
 * se compara acá y `mejorPorEquipo` queda como el caso sin acompañante.
 */
export function mejorPorEquipoCon<T>(items: T[], filaDe: (item: T) => ParsedRow): T[] {
  const mejores = new Map<string, T>();

  for (const item of items) {
    const fila = filaDe(item);
    const clave = `${claveEquipo(fila)}|${fila.currency}`;
    const actual = mejores.get(clave);
    if (!actual || fila.cost < filaDe(actual).cost) mejores.set(clave, item);
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

/** Una persona que escribe en los chats, con lo que se sabe de ella. */
export interface AutorDetectado {
  /** El teléfono tal como lo entrega WhatsApp, para mostrarlo y copiarlo. */
  telefono: string;
  /** La forma reducida, que es con la que se empareja. */
  comparable: string;
  nombre: string | null;
  /** En qué chats apareció, por nombre. Un proveedor suele estar en varios. */
  chats: string[];
  mensajes: number;
  /** Cuántos de esos mensajes tienen pinta de lista de precios. */
  listas: number;
  /** Fecha del último mensaje que parecía lista, o `null` si nunca mandó una. */
  ultimaLista: string | null;
  /** El proveedor con el que empareja, o `null` si todavía no está cargado. */
  proveedor: Supplier | null;
  /**
   * Ya existe un proveedor con este teléfono, pero está desactivado.
   *
   * Sin este dato, el desactivado se vería igual que uno que nunca se cargó,
   * y volver a cargarlo dejaría dos proveedores con el mismo teléfono y
   * márgenes distintos. Cuál de los dos gana al emparejar depende del orden
   * en que vuelvan de la base, que no es una decisión de nadie.
   */
  proveedorInactivo: boolean;
  /** El texto de su última lista, para poder reconocerlo sin salir del panel. */
  ultimoTexto: string | null;
  /** El nombre que dice su propia lista, si lo dice. Para proponerlo al cargar. */
  nombreDeLaLista: string | null;
  /** El nombre de su grupo, solo si es el único que publica listas ahí. */
  nombreDelGrupo: string | null;
  /** En cuántos días distintos mandó listas. Un proveedor manda casi a diario. */
  diasConListas: number;
  /** Cuántos equipos se le contaron a la última lista. */
  equiposEnUltima: number;
  /** De 0 a 100, qué tan probable es que sea un proveedor. */
  confianza: number;
  /** Por qué se le dio esa confianza, en palabras. Nunca un número solo. */
  senales: string[];
}

/**
 * Palabras que aparecen en el encabezado de casi toda lista y no nombran a
 * nadie. Un candidato que solo tiene de estas no es un nombre.
 */
const PALABRAS_GENERICAS = new Set([
  "lista",
  "listado",
  "precios",
  "precio",
  "stock",
  "actualizado",
  "actualizada",
  "mayorista",
  "mayoristas",
  "revendedores",
  "revendedor",
  "usados",
  "usado",
  "nuevos",
  "nuevo",
  "sellados",
  "sellado",
  "vip",
  "hoy",
  "al",
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "y",
  "o",
  "con",
  "para",
  "buenos",
  "dias",
  "buen",
  "dia",
  "tarde",
  "apple",
  "iphone",
  "samsung",
  "xiaomi",
  "motorola",
  "watch",
  "macbook",
  "macbooks",
  "ipad",
  "playstation",
  "camaras",
  "camara",
  "deportivas",
  "accesorios",
  "entrega",
  "inmediata",
  "disponible",
  "oferta",
  "ofertas",
  "tester",
  "seminuevos",
  "importados",

  "usd",
  "ars",
  "pesos",
  "dolares",
  "envio",
  "envios",
  "en",
  "canal",
  "difusion",
  "comunidad",
  "grupo",
  "revendedoras",
]);

/**
 * El nombre del proveedor, si lo dice en su propia lista.
 *
 * Los proveedores encabezan la lista con su marca —PROVE-TECH, TECHDOG— pero
 * no todos: muchos arrancan con "LISTADO USADOS AL 30/10" o con la categoría
 * de lo que venden. Esto devuelve `null` cuando no encuentra algo que parezca
 * un nombre, que es lo correcto: sugerir "Lista Vip" como nombre de proveedor
 * es peor que no sugerir nada.
 *
 * La normalización no es un detalle. Varios escriben el encabezado con los
 * caracteres matemáticos de Unicode para que se vea en negrita —𝗧𝗘𝗖𝗛𝗗𝗢𝗚 no
 * tiene una sola letra ASCII— y sin pasarlos a su forma simple no coinciden
 * con nada ni se pueden comparar con la lista de palabras genéricas.
 */
export function nombreSugerido(texto: string | null): string | null {
  if (!texto) return null;

  const lineas = texto
    .normalize("NFKC")
    .split("\n")
    .map((l) =>
      l
        // Separadores con los que encadenan nombre y rubro: "TECHDOG · APPLE".
        .split(/[·|]/)[0]
        // Markdown de WhatsApp y adornos.
        .replace(/[*_~`]/g, "")
        // Emoji, banderas y símbolos sueltos.
        .replace(
          /[\p{Extended_Pictographic}\p{Emoji_Presentation}\u{1F1E6}-\u{1F1FF}]/gu,
          ""
        )
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);

  /*
   * Solo el primer renglón.
   *
   * Medido contra las listas reales: mirando los primeros cuatro, de seis
   * proveedores salían dos nombres buenos y tres inventados —"Midnight", que
   * es un color; "En Usd", de un renglón de moneda; "Envio", de un saludo—.
   * Los dos nombres de verdad estaban en el primer renglón.
   *
   * Un nombre inventado es peor que ninguno: alguien lo acepta sin mirar y
   * queda un proveedor llamado Midnight para siempre. Mejor pedirlo a mano.
   */
  for (const linea of lineas.slice(0, 1)) {
    // Una fecha en el encabezado es "LISTADO AL 30/10", no un nombre.
    if (/\d{1,2}[/-]\d{1,2}/.test(linea)) continue;
    if (linea.length < 3 || linea.length > 40) continue;

    const palabras = linea.split(" ").filter(Boolean);
    if (palabras.length > 4) continue;

    /* Sin acentos para comparar: la lista de genéricas dice "camaras" y el
       encabezado dice "CÁMARAS". Con acento no coincidía y "Cámaras
       Deportivas" se colaba como nombre de proveedor. */
    const propias = palabras.filter((w) => {
      const limpia = w
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,:;!¡?¿]/g, "");
      return !PALABRAS_GENERICAS.has(limpia);
    });
    if (propias.length === 0) continue;

    const nombre = propias
      .join(" ")
      .replace(/[.,:;]+$/, "")
      .trim();
    if (nombre.length < 3) continue;

    /* Casi todos lo escriben en mayúsculas. Se pasa a capitalizado porque va a
       un campo que después se lee en pantallas y listados, no a un cartel. */
    /* También después de un guion: PROVE-TECH es "Prove-Tech", no
       "Prove-tech". Son marcas y así es como las escriben. */
    return nombre
      .toLowerCase()
      .replace(/(^|[\s-])(\p{L})/gu, (_, antes, letra) => antes + letra.toUpperCase());
  }

  return null;
}

/**
 * El nombre de un proveedor a partir del nombre de su grupo.
 *
 * Muchos publican en un grupo o canal propio: "Fany Lista", "DIFUSIÓN VIP
 * -FRAN-", "Canal Mayorista | @provetech.ar". Un @usuario es lo más confiable
 * que puede traer. Si no hay, se quitan las palabras que describen al grupo y
 * no a su dueño. Sin nada propio, como en "REVENDEDORES IPHONE", no hay nombre.
 */
export function nombreDesdeGrupo(grupo: string | null): string | null {
  if (!grupo) return null;
  const texto = grupo.normalize("NFKC");

  const usuario = texto.match(/@([\p{L}\d_-]+)/u);
  if (usuario) return usuario[1].charAt(0).toUpperCase() + usuario[1].slice(1);

  const propias = texto
    .replace(
      /[\p{Extended_Pictographic}\p{Emoji_Presentation}\u{1F1E6}-\u{1F1FF}]/gu,
      " "
    )
    .split(/[\s|·]+/)
    .map((w) => w.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, ""))
    .filter(Boolean)
    .filter(
      (w) =>
        !PALABRAS_GENERICAS.has(
          w
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        )
    );
  if (propias.length === 0 || propias.join(" ").length < 3) return null;

  // Solo se capitaliza lo que está todo en mayúsculas: "iCell" queda como está.
  return propias
    .map((w) =>
      w === w.toUpperCase() && /\p{L}/u.test(w)
        ? w.charAt(0) + w.slice(1).toLowerCase()
        : w
    )
    .join(" ");
}

/**
 * Cuántos renglones de la lista parecen un equipo con precio.
 *
 * Más exigente que `pareceLista`, que solo pide tres renglones con algún
 * número de tres cifras: acá se pide además que el renglón tenga letras, para
 * no contar una tanda de precios sueltos o un número de teléfono partido.
 */
export function renglonesDeEquipo(texto: string): number {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /\d{3,}/.test(l) && /[a-záéíóúñ]{3,}/i.test(l)).length;
}

/**
 * Qué tan probable es que alguien sea un proveedor, y por qué.
 *
 * Esto es una sugerencia, no una decisión: quien carga al proveedor es una
 * persona, porque equivocarse significa publicar precios de alguien que no
 * vende. Por eso devuelve también las razones. Un número solo —"87% de
 * confianza"— no se puede discutir; "manda listas 3 de los últimos 3 días, 42
 * equipos en la última" sí, y se verifica de un vistazo.
 *
 * Las señales son las que se observan en los chats de verdad:
 *
 * - **Manda listas.** Es la condición, no una señal más: sin listas no hay
 *   nada que importar por más que escriba todo el día.
 * - **Las manda seguido.** Un proveedor pasa su lista casi a diario; quien
 *   mandó una sola vez puede ser un revendedor reenviando algo.
 * - **Las listas son largas.** Cuarenta equipos es un mayorista; cuatro es
 *   alguien contestando por un modelo puntual.
 * - **Tiene nombre guardado.** Débil pero suma: a los proveedores se los
 *   agenda.
 */
export function confianzaProveedor(autor: {
  listas: number;
  diasConListas: number;
  equiposEnUltima: number;
  nombre: string | null;
  mensajes: number;
}): { puntos: number; senales: string[] } {
  if (autor.listas === 0) {
    return { puntos: 0, senales: ["Nunca mandó algo que parezca una lista"] };
  }

  let puntos = 35;
  const senales = [
    autor.listas === 1 ? "Mandó una lista" : `Mandó ${autor.listas} listas`,
  ];

  if (autor.diasConListas >= 3) {
    puntos += 30;
    senales.push(`En ${autor.diasConListas} días distintos`);
  } else if (autor.diasConListas === 2) {
    puntos += 18;
    senales.push("En 2 días distintos");
  }

  if (autor.equiposEnUltima >= 25) {
    puntos += 25;
    senales.push(`${autor.equiposEnUltima} equipos en la última`);
  } else if (autor.equiposEnUltima >= 10) {
    puntos += 15;
    senales.push(`${autor.equiposEnUltima} equipos en la última`);
  } else if (autor.equiposEnUltima > 0) {
    puntos += 5;
    senales.push(`Solo ${autor.equiposEnUltima} equipos en la última`);
  }

  if (autor.nombre) {
    puntos += 10;
    senales.push("Está agendado");
  }

  return { puntos: Math.min(100, puntos), senales };
}

/**
 * Quiénes escriben en los chats, y cuáles de ellos ya son proveedores cargados.
 *
 * Esta es la pantalla previa a todo lo demás. El panel no puede pedirle al
 * dueño que cargue el teléfono de once proveedores a mano y sin equivocarse:
 * los teléfonos no están a la vista en WhatsApp, y basta un dígito mal para
 * que una lista se publique con el margen de otro proveedor.
 *
 * Se agrupa por **autor y no por chat**, por la misma razón que
 * `proveedorDelMensaje` mira el autor: en un grupo de revendedores publican
 * varios proveedores distintos. Agrupar por chat los mostraría como una sola
 * fila —"comunidad iCell Oeste"— y no habría forma de mapear a cada uno.
 *
 * El mismo autor que escribe en un grupo y también por privado es una sola
 * fila, porque la clave es el teléfono reducido. Sus dos chats quedan
 * listados en `chats`, que es justamente el dato que permite reconocerlo.
 *
 * Los mensajes propios se descartan: nunca son listas de proveedor.
 */
export function autoresDetectados(
  chats: ChatWhatsapp[],
  proveedores: Supplier[]
): AutorDetectado[] {
  const autoresDeListas = new Map<string, Set<string>>();
  for (const chat of chats) {
    if (!chat.grupo) continue;
    const autores = new Set<string>();
    for (const m of chat.mensajes) {
      if (!m.mio && pareceLista(m.texto) && m.autor) {
        autores.add(telefonoComparable(m.autor));
      }
    }
    autoresDeListas.set(chat.jid, autores);
  }

  /* Los días con lista se acumulan aparte porque hay que contarlos sin
     repetir: tres listas en una tarde son un día, no tres. */
  const dias = new Map<string, Set<string>>();
  const porAutor = new Map<string, AutorDetectado>();

  for (const chat of chats) {
    for (const mensaje of chat.mensajes) {
      if (mensaje.mio) continue;

      const telefono = chat.grupo ? mensaje.autor : (mensaje.autor ?? chat.telefono);
      const comparable = telefonoComparable(telefono);
      // Sin código de área no se puede emparejar sin riesgo de confundir a dos
      // proveedores de ciudades distintas: no se muestra como mapeable.
      if (!comparable || !telefono) continue;

      let autor = porAutor.get(comparable);
      if (!autor) {
        autor = {
          telefono,
          comparable,
          nombre: null,
          chats: [],
          mensajes: 0,
          listas: 0,
          ultimaLista: null,
          proveedor: proveedorDelMensaje(chat, mensaje, proveedores),
          proveedorInactivo: proveedores.some(
            (p) => !p.isActive && telefonoComparable(p.phone) === comparable
          ),
          ultimoTexto: null,
          nombreDeLaLista: null,
          nombreDelGrupo: null,
          diasConListas: 0,
          equiposEnUltima: 0,
          confianza: 0,
          senales: [],
        };
        porAutor.set(comparable, autor);
        dias.set(comparable, new Set());
      }

      if (mensaje.autorNombre && !autor.nombre) autor.nombre = mensaje.autorNombre;

      const dondeEscribio = chat.nombre ?? chat.telefono;
      if (!autor.chats.includes(dondeEscribio)) autor.chats.push(dondeEscribio);

      autor.mensajes += 1;
      if (pareceLista(mensaje.texto)) {
        autor.listas += 1;
        if (!autor.nombreDelGrupo && autoresDeListas.get(chat.jid)?.size === 1) {
          autor.nombreDelGrupo = nombreDesdeGrupo(chat.nombre);
        }
        dias.get(comparable)?.add(mensaje.fecha.slice(0, 10));
        if (!autor.ultimaLista || mensaje.fecha > autor.ultimaLista) {
          autor.ultimaLista = mensaje.fecha;
          autor.ultimoTexto = mensaje.texto;
          autor.equiposEnUltima = renglonesDeEquipo(mensaje.texto);
          autor.nombreDeLaLista = nombreSugerido(mensaje.texto);
        }
      }
    }
  }

  for (const [comparable, autor] of porAutor) {
    autor.diasConListas = dias.get(comparable)?.size ?? 0;
    const { puntos, senales } = confianzaProveedor(autor);
    autor.confianza = puntos;
    autor.senales = senales;
  }

  /*
   * El orden es el del trabajo que hay que hacer, no el alfabético: arriba
   * quien manda listas y todavía no está cargado, que es la fila que pide una
   * acción. Entre esos manda la confianza, que es el orden en que conviene
   * mirarlos.
   */
  return [...porAutor.values()].sort((a, b) => {
    const pendienteA = a.listas > 0 && !a.proveedor;
    const pendienteB = b.listas > 0 && !b.proveedor;
    if (pendienteA !== pendienteB) return pendienteA ? -1 : 1;
    if (a.confianza !== b.confianza) return b.confianza - a.confianza;
    return b.mensajes - a.mensajes;
  });
}
