import type { ParsedRow, Supplier } from "@/types";
import { sellPrice } from "./parser";
import {
  equiposSinStock,
  listaPendiente,
  mejorPorEquipoCon,
  proveedorDelMensaje,
  revisarAntesDePublicar,
  type ChatWhatsapp,
  type MensajeWhatsapp,
  type Revision,
} from "./sincronizar";

/**
 * El plan de una sincronización, de punta a punta y sin efectos.
 *
 * Entre leer WhatsApp y escribir en el catálogo hay una llamada a Claude, que
 * cuesta plata y tarda. Así que esto va partido en dos funciones puras con el
 * paso caro en el medio:
 *
 *   listasParaImportar()  →  Claude interpreta  →  planificarPublicacion()
 *
 * La primera decide **a qué se le paga**: sin ella se le mandaría a Claude
 * todo lo que haya en los chats, incluidas las listas ya importadas. La
 * segunda decide **qué se publica**, y es la que puede dejar un precio mal en
 * la tienda, así que es la que más tests tiene.
 */

export interface ListaParaImportar {
  proveedor: Supplier;
  mensaje: MensajeWhatsapp;
  /** En qué chat apareció. Solo para mostrarlo en el panel. */
  chat: string;
}

/**
 * Qué listas hay que interpretar, una por proveedor como máximo.
 *
 * Los mensajes se juntan **por proveedor y no por chat** antes de elegir. Esa
 * es la parte que importa: el proveedor que manda su lista al grupo y después
 * la corrige por privado dejó la versión buena en el privado, y mirando cada
 * chat por separado se importarían las dos, compitiendo entre sí por el mejor
 * precio con datos de la misma persona.
 *
 * `ultimaImportacion` es lo que evita volver a pagarle a Claude por una lista
 * que ya entró.
 */
export function listasParaImportar(
  chats: ChatWhatsapp[],
  proveedores: Supplier[],
  ultimaImportacion: (proveedorId: string) => string | null
): ListaParaImportar[] {
  const porProveedor = new Map<
    string,
    { proveedor: Supplier; mensajes: MensajeWhatsapp[]; chats: Map<string, string> }
  >();

  for (const chat of chats) {
    for (const mensaje of chat.mensajes) {
      if (mensaje.mio) continue;

      const proveedor = proveedorDelMensaje(chat, mensaje, proveedores);
      if (!proveedor) continue;

      let acumulado = porProveedor.get(proveedor.id);
      if (!acumulado) {
        acumulado = { proveedor, mensajes: [], chats: new Map() };
        porProveedor.set(proveedor.id, acumulado);
      }

      acumulado.mensajes.push(mensaje);
      // Se recuerda de qué chat vino cada mensaje: al final se informa el del
      // que ganó, no el último que se vio.
      acumulado.chats.set(mensaje.fecha + mensaje.texto, chat.nombre ?? chat.telefono);
    }
  }

  const listas: ListaParaImportar[] = [];

  for (const { proveedor, mensajes, chats: dondeVino } of porProveedor.values()) {
    const mensaje = listaPendiente(mensajes, ultimaImportacion(proveedor.id));
    if (!mensaje) continue;

    listas.push({
      proveedor,
      mensaje,
      chat: dondeVino.get(mensaje.fecha + mensaje.texto) ?? "—",
    });
  }

  return listas;
}

/** Lo que Claude devolvió para un proveedor, con su lista anterior al lado. */
export interface ListaInterpretada {
  proveedor: Supplier;
  filas: ParsedRow[];
  /** Las filas de su importación anterior, para comparar. Vacío la primera vez. */
  filasAnteriores: ParsedRow[];
}

export interface EquipoAPublicar {
  fila: ParsedRow;
  /** De quién es el precio que ganó: define el margen que se le aplica. */
  proveedor: Supplier;
  precioArs: number;
  precioUsd: number;
  costoUsd: number;
}

/** Una lista que no se publica sola porque algo no cerraba. */
export interface ListaFrenada {
  proveedor: Supplier;
  revisiones: Revision[];
}

export interface Plan {
  publicar: EquipoAPublicar[];
  frenadas: ListaFrenada[];
  /** Claves de equipo que hay que poner en stock cero. Nunca se borran. */
  sinStock: string[];
}

/**
 * Qué se publica, qué espera a una persona y qué se queda sin stock.
 *
 * Una lista con avisos **no entra en la comparación de precios**, y esto es lo
 * que más cuesta ver: si entrara, un costo con un dígito de menos ganaría
 * justamente por estar mal, y el equipo se publicaría barato con el aviso
 * colgado al costado. Frenar la lista entera es más tosco que frenar la fila
 * sospechosa, y es a propósito: cuando un proveedor manda una lista con un
 * precio imposible, lo más probable es que haya mandado otra cosa —una
 * respuesta puntual, una lista de otro mes— y no que se haya equivocado en un
 * renglón.
 *
 * El margen sale del proveedor que ganó, no del promedio ni del primero: es su
 * costo el que se está marcando.
 */
export function planificarPublicacion(
  interpretadas: ListaInterpretada[],
  cotizacionDolar: number
): Plan {
  const frenadas: ListaFrenada[] = [];
  const candidatas: {
    fila: ParsedRow;
    proveedor: Supplier;
    /** La misma fila con el costo pasado a dólares, solo para comparar. */
    comparable: ParsedRow;
  }[] = [];

  for (const { proveedor, filas, filasAnteriores } of interpretadas) {
    const revisiones = revisarAntesDePublicar(filas, filasAnteriores);

    if (revisiones.length > 0) {
      frenadas.push({ proveedor, revisiones });
      continue;
    }

    for (const fila of filas) {
      /*
       * `mejorPorEquipo` no compara entre monedas, y hace bien: sin cotización,
       * 900 dólares contra 1.080.000 pesos gana siempre el dólar por ser el
       * número más chico. Pero acá sí hay cotización, y sin usarla el mismo
       * equipo ofrecido en las dos monedas se publica **dos veces**, con dos
       * precios distintos, en el mismo catálogo.
       *
       * Así que se compara en dólares y se publica con la fila original: el
       * costo que se marca es el que el proveedor escribió, no el convertido.
       */
      const comparable: ParsedRow =
        fila.currency === "USD"
          ? fila
          : { ...fila, cost: fila.cost / cotizacionDolar, currency: "USD" };

      candidatas.push({ fila, proveedor, comparable });
    }
  }

  const ganadoras = mejorPorEquipoCon(candidatas, (c) => c.comparable);

  const publicar = ganadoras.map(({ fila, proveedor }) => {
    const precio = sellPrice(
      fila.cost,
      fila.currency,
      proveedor.defaultMarginPct,
      cotizacionDolar
    );
    return {
      fila,
      proveedor,
      precioArs: precio.priceArs,
      precioUsd: precio.priceUsd,
      costoUsd: precio.costUsd,
    };
  });

  /*
   * El stock cero se calcula solo con las listas que entraron. Una lista
   * frenada no dice nada sobre qué dejó de estar: tratarla como si lo dijera
   * pondría en cero todo el catálogo de ese proveedor por un precio raro.
   */
  const anteriores = interpretadas
    .filter((i) => !frenadas.some((f) => f.proveedor.id === i.proveedor.id))
    .flatMap((i) => i.filasAnteriores);

  const sinStock = equiposSinStock(
    publicar.map((p) => p.fila),
    anteriores
  );

  return { publicar, frenadas, sinStock };
}
