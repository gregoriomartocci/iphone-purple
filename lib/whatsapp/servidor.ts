import type { ChatWhatsapp } from "./sincronizar";

/**
 * El cliente del proceso que lee WhatsApp.
 *
 * El lector no puede vivir acá: Baileys mantiene una sesión abierta contra
 * WhatsApp y el sitio corre en funciones que arrancan y mueren con cada
 * pedido. Así que corre aparte —en Railway— y esto es lo único que lo toca:
 * dos lecturas por HTTP, con token.
 *
 * Nada de acá escribe ni manda mensajes. El servidor tampoco los expone: una
 * línea de WhatsApp Business que empieza a mandar mensajes automáticos es una
 * línea que WhatsApp puede bloquear, y es la del negocio.
 */

/** Lo que devuelve `/salud`, que no pide token. */
/** Algo que le pasó a la conexión, para poder contarlo en orden. */
export interface EventoConexion {
  cuando: string;
  tipo: "qr" | "escaneado" | "conectado" | "rechazado" | "caida" | "pausa" | "reanudado";
  detalle: string | null;
}

export interface SaludServidor {
  /**
   * El estado crudo de la conexión con WhatsApp.
   *
   * `desvinculado` importa: el lector sigue vivo pero dejó de intentar, así
   * que no va a aparecer ningún QR por más que se espere.
   */
  conexion: string;
  vinculado: boolean;
  /** `true` cuando hay un QR esperando que alguien lo escanee. */
  faltaVincular: boolean;
  /**
   * La línea vinculada. No es secreta —está en la web del negocio— y es lo que
   * permite ver si se escaneó con la cuenta que correspondía.
   */
  numero: string | null;
  /** La línea vinculada no era la esperada: el lector se desvinculó solo. */
  lineaIncorrecta: boolean;
  /** Si el lector tiene configurado contra qué número comparar. */
  verificaNumero: boolean;
  /**
   * Dejó de pedir vinculaciones porque nadie escaneaba.
   *
   * No es un error: es la protección que evita que un lector encendido y
   * olvidado gaste el cupo de vinculaciones de la línea.
   */
  enPausa: boolean;
  /** Cuántos códigos se ofrecieron desde el último enganche, y cuántos admite. */
  intentos: number;
  intentosMaximos: number;
  /** Cuándo WhatsApp rechazó la conexión por última vez, si pasó. */
  ultimoRechazo: string | null;
  /**
   * Lo último que le pasó a la conexión, con su hora.
   *
   * Sin esto el panel solo podía mostrar el estado de ahora, y un estado sin
   * historia no se entiende: "esperando escaneo" significa cosas muy distintas
   * si recién arrancó o si viene rechazado cinco veces en la última hora.
   */
  eventos: EventoConexion[];
  /** La hora del lector, que es con la que están sellados los eventos. */
  ahora: string;
  chats: number;
  mensajes: number;
  ultimoMensaje: string | null;
  desde: string;
}

export interface MensajesServidor {
  dias: number;
  generado: string;
  chats: ChatWhatsapp[];
}

export interface QrServidor {
  /**
   * El QR ya dibujado, listo para meter en el HTML. `null` cuando no hay
   * ninguno esperando: o la línea está vinculada, o el código caducó.
   *
   * Viene dibujado y no como texto a propósito: el string del QR es la
   * credencial que vincula la cuenta, y acá no hace falta tenerlo.
   */
  svg: string | null;
  vinculado: boolean;
}

/** Lo que WhatsApp sabe de un contacto más allá de sus mensajes. */
export interface PerfilContacto {
  id: string;
  /** Solo si usa WhatsApp Business. La mayoría de los proveedores no. */
  negocio: {
    descripcion: string | null;
    categoria: string | null;
    email: string | null;
    sitios: string[];
    direccion: string | null;
  } | null;
  /** El texto de "info" del contacto. Suele decir el rubro o el horario. */
  estado: string | null;
  foto: string | null;
}

export type MotivoFalla =
  | "sin-configurar"
  /** No hay nadie escuchando: el proceso del lector no está corriendo. */
  | "apagado"
  /** Está corriendo pero tardó más de la cuenta en contestar. */
  | "sin-respuesta"
  /** La dirección no resuelve: está mal escrita o el servicio ya no existe. */
  | "no-existe"
  | "no-autorizado"
  | "respuesta-rara";

export type Resultado<T> =
  { ok: true; datos: T } | { ok: false; motivo: MotivoFalla; detalle: string };

/**
 * Cuánto se espera antes de dar el pedido por perdido.
 *
 * Railway duerme los servicios que no reciben tráfico y el primero que llega
 * paga el arranque. Diez segundos alcanzan para eso; más que eso deja colgada
 * la pantalla del panel, que es peor que decir "no contestó, probá de nuevo".
 */
const ESPERA_MS = 10_000;

export function servidorConfigurado(): boolean {
  return Boolean(
    process.env.WHATSAPP_SERVIDOR_URL && process.env.WHATSAPP_SERVIDOR_TOKEN
  );
}

async function pedir<T>(ruta: string, conToken: boolean): Promise<Resultado<T>> {
  const base = process.env.WHATSAPP_SERVIDOR_URL;
  const token = process.env.WHATSAPP_SERVIDOR_TOKEN;

  if (!base || (conToken && !token)) {
    return {
      ok: false,
      motivo: "sin-configurar",
      detalle: "Faltan WHATSAPP_SERVIDOR_URL o WHATSAPP_SERVIDOR_TOKEN.",
    };
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(new URL(ruta, base), {
      headers: conToken ? { authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(ESPERA_MS),
      cache: "no-store",
    });
  } catch (e) {
    /*
     * `fetch` de Node devuelve siempre "fetch failed" y guarda la causa real
     * en `cause`. Sin desenvolverla, el panel mostraba ese texto tal cual, que
     * no distingue entre el lector apagado, una URL mal escrita y una demora:
     * tres problemas con tres soluciones distintas.
     */
    const causa = (e as { cause?: { code?: string } })?.cause?.code;
    const nombreError = e instanceof Error ? e.name : "";

    if (causa === "ECONNREFUSED") {
      return {
        ok: false,
        motivo: "apagado",
        detalle: "El lector no está corriendo: nadie contesta en esa dirección.",
      };
    }
    if (causa === "ENOTFOUND" || causa === "EAI_AGAIN") {
      return {
        ok: false,
        motivo: "no-existe",
        detalle: "No se pudo resolver la dirección del lector. Revisá la URL.",
      };
    }
    if (nombreError === "TimeoutError" || nombreError === "AbortError") {
      return {
        ok: false,
        motivo: "sin-respuesta",
        detalle: `El lector no contestó en ${ESPERA_MS / 1000} segundos.`,
      };
    }
    return {
      ok: false,
      motivo: "sin-respuesta",
      detalle:
        e instanceof Error ? `${e.message}${causa ? ` (${causa})` : ""}` : String(e),
    };
  }

  if (respuesta.status === 401) {
    return {
      ok: false,
      motivo: "no-autorizado",
      detalle: "El servidor rechazó el token.",
    };
  }
  if (!respuesta.ok) {
    return {
      ok: false,
      motivo: "respuesta-rara",
      detalle: `El servidor respondió ${respuesta.status}.`,
    };
  }

  try {
    return { ok: true, datos: (await respuesta.json()) as T };
  } catch {
    // Pasa cuando la URL apunta a otra cosa —el propio sitio, por ejemplo— y
    // vuelve HTML. Sin este caso el panel mostraría una pantalla en blanco.
    return {
      ok: false,
      motivo: "respuesta-rara",
      detalle: "La respuesta no era JSON. Revisá que la URL sea la del lector.",
    };
  }
}

/**
 * Completa lo que falte en la respuesta de `/salud`.
 *
 * El lector y el sitio se despliegan por separado, así que uno puede estar en
 * una versión anterior. Un campo faltante no puede tirar la pantalla que
 * justamente sirve para entender qué le pasa a la conexión.
 */
function completarSalud(datos: Partial<SaludServidor>): SaludServidor {
  return {
    conexion: datos.conexion ?? "desconocida",
    vinculado: datos.vinculado ?? false,
    faltaVincular: datos.faltaVincular ?? false,
    numero: datos.numero ?? null,
    lineaIncorrecta: datos.lineaIncorrecta ?? false,
    verificaNumero: datos.verificaNumero ?? false,
    enPausa: datos.enPausa ?? false,
    intentos: datos.intentos ?? 0,
    intentosMaximos: datos.intentosMaximos ?? 0,
    ultimoRechazo: datos.ultimoRechazo ?? null,
    eventos: datos.eventos ?? [],
    ahora: datos.ahora ?? new Date().toISOString(),
    chats: datos.chats ?? 0,
    mensajes: datos.mensajes ?? 0,
    ultimoMensaje: datos.ultimoMensaje ?? null,
    desde: datos.desde ?? "",
  };
}

export async function pedirSalud(): Promise<Resultado<SaludServidor>> {
  const r = await pedir<Partial<SaludServidor>>("/salud", false);
  return r.ok ? { ok: true, datos: completarSalud(r.datos) } : r;
}

export function pedirQr(): Promise<Resultado<QrServidor>> {
  return pedir<QrServidor>("/qr", true);
}

/**
 * Todo lo que se sepa de un contacto.
 *
 * Es una consulta a WhatsApp, así que se pide cuando alguien la mira y no
 * para toda la lista: con veinte proveedores serían sesenta llamadas seguidas
 * sobre la misma línea. El lector la cachea.
 */
export function pedirPerfil(id: string): Promise<Resultado<PerfilContacto>> {
  return pedir<PerfilContacto>(`/perfil?id=${encodeURIComponent(id)}`, true);
}

/** Saca al lector de la pausa y vuelve a pedir vinculación. */
export function reanudarLector(): Promise<Resultado<{ ok: boolean }>> {
  return pedir("/reanudar", true);
}

export function pedirMensajes(dias = 3): Promise<Resultado<MensajesServidor>> {
  return pedir<MensajesServidor>(`/mensajes?dias=${dias}`, true);
}
