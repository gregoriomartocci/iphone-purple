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

export function pedirSalud(): Promise<Resultado<SaludServidor>> {
  return pedir<SaludServidor>("/salud", false);
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
