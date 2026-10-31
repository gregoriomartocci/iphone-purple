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
export interface SaludServidor {
  conexion: string;
  vinculado: boolean;
  /** `true` cuando hay un QR esperando que alguien lo escanee. */
  faltaVincular: boolean;
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

export type MotivoFalla =
  "sin-configurar" | "sin-respuesta" | "no-autorizado" | "respuesta-rara";

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
    return {
      ok: false,
      motivo: "sin-respuesta",
      detalle: e instanceof Error ? e.message : String(e),
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

export function pedirSalud(): Promise<Resultado<SaludServidor>> {
  return pedir<SaludServidor>("/salud", false);
}

export function pedirMensajes(dias = 3): Promise<Resultado<MensajesServidor>> {
  return pedir<MensajesServidor>(`/mensajes?dias=${dias}`, true);
}
