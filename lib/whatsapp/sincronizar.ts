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
  if (!buscado) return null;

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
        };
        porAutor.set(comparable, autor);
      }

      if (mensaje.autorNombre && !autor.nombre) autor.nombre = mensaje.autorNombre;

      const dondeEscribio = chat.nombre ?? chat.telefono;
      if (!autor.chats.includes(dondeEscribio)) autor.chats.push(dondeEscribio);

      autor.mensajes += 1;
      if (pareceLista(mensaje.texto)) {
        autor.listas += 1;
        if (!autor.ultimaLista || mensaje.fecha > autor.ultimaLista) {
          autor.ultimaLista = mensaje.fecha;
        }
      }
    }
  }

  /*
   * El orden es el del trabajo que hay que hacer, no el alfabético: arriba
   * quien manda listas y todavía no está cargado, que es la fila que pide una
   * acción. Después, a igualdad de condición, quien manda más listas.
   */
  return [...porAutor.values()].sort((a, b) => {
    const pendienteA = a.listas > 0 && !a.proveedor;
    const pendienteB = b.listas > 0 && !b.proveedor;
    if (pendienteA !== pendienteB) return pendienteA ? -1 : 1;
    if (a.listas !== b.listas) return b.listas - a.listas;
    return b.mensajes - a.mensajes;
  });
}
