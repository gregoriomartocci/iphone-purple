"use server";

import { spawn } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getSettings, isSupabaseConfigured } from "@/lib/data";
import { getSuppliers } from "@/lib/data/admin";
import {
  pedirCodigoNuevo,
  pedirPerfil,
  pedirMensajes,
  pedirQr,
  pedirSalud,
  servidorConfigurado,
} from "@/lib/whatsapp/servidor";
import { parseSupplierList } from "@/lib/whatsapp/parser";
import {
  listasParaImportar,
  planificarPublicacion,
  type ListaInterpretada,
} from "@/lib/whatsapp/plan";
import {
  NO_DB,
  ParsedRowSchema,
  publicarFilas,
  requireAdmin,
  skuDesdeClave,
  type ActionResult,
} from "@/lib/admin/publicar";
import type { ParsedRow } from "@/types";
import type { PerfilContacto } from "@/lib/whatsapp/servidor";

/**
 * El camino completo de WhatsApp al catálogo, partido en dos pasos.
 *
 * `planificarDesdeWhatsappAction` lee, interpreta y decide, pero **no escribe
 * nada**. `publicarPlanAction` escribe lo que una persona aprobó.
 *
 * Están separados a propósito y no es ceremonia: interpretar cuesta plata y
 * publicar cambia precios de cara al cliente. Que el paso caro sea reversible
 * —mirás el plan, no te convence, no publicás— es lo que permite correr esto
 * sin miedo. Juntarlos en un botón sería una operación que gasta y publica a
 * la vez, sin ningún punto donde frenar.
 */

/** Un proveedor con sus filas listas para publicar, ya con su margen. */
export interface LoteProveedor {
  proveedorId: string;
  proveedorNombre: string;
  marginPct: number;
  /** El mensaje original. Va a `supplier_imports` para poder auditar después. */
  rawText: string;
  filas: ParsedRow[];
}

export interface PlanParaRevisar {
  lotes: LoteProveedor[];
  /** Listas que no se publican solas: alguien tiene que mirarlas. */
  frenadas: { proveedor: string; revisiones: { motivo: string; detalle: string }[] }[];
  /** Lo que un proveedor dejó de ofrecer. Se pone en cero, nunca se borra. */
  sinStock: string[];
  dollarRate: number;
  /** Líneas que el intérprete no pudo leer, por proveedor. */
  avisos: { proveedor: string; textos: string[] }[];
  /** Cuántos mensajes se mandaron a interpretar. Es lo que se gastó. */
  listasInterpretadas: number;
}

export async function planificarDesdeWhatsappAction(
  dias = 3
): Promise<ActionResult<PlanParaRevisar>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };
  if (!servidorConfigurado()) {
    return {
      ok: false,
      error:
        "Falta configurar el lector de WhatsApp. Cargá WHATSAPP_SERVIDOR_URL y WHATSAPP_SERVIDOR_TOKEN.",
    };
  }

  const mensajes = await pedirMensajes(dias);
  if (!mensajes.ok) return { ok: false, error: mensajes.detalle };

  try {
    const supabase = createAdminClient();
    const [proveedores, settings] = await Promise.all([getSuppliers(), getSettings()]);

    /*
     * La última importación de cada proveedor sirve para dos cosas distintas:
     * saltear mensajes ya procesados, y comparar la lista nueva contra la
     * anterior para detectar que se encogió de golpe. Se trae una sola vez,
     * ordenada, y se queda con la primera de cada proveedor.
     */
    const { data: importaciones } = await supabase
      .from("supplier_imports")
      .select("supplier_id, created_at, parsed_json")
      .order("created_at", { ascending: false });

    const ultima = new Map<string, { fecha: string; filas: ParsedRow[] }>();
    for (const fila of importaciones ?? []) {
      const id = fila.supplier_id as string | null;
      if (!id || ultima.has(id)) continue;
      ultima.set(id, {
        fecha: fila.created_at as string,
        filas: (fila.parsed_json ?? []) as ParsedRow[],
      });
    }

    const listas = listasParaImportar(
      mensajes.datos.chats,
      proveedores,
      (id) => ultima.get(id)?.fecha ?? null
    );

    if (listas.length === 0) {
      return {
        ok: false,
        error:
          "No hay listas nuevas para interpretar. O ningún proveedor mandó nada, o ya se importó todo lo que mandaron.",
      };
    }

    const interpretadas: ListaInterpretada[] = [];
    const avisos: PlanParaRevisar["avisos"] = [];
    const textoDe = new Map<string, string>();

    for (const lista of listas) {
      const { rows, warnings } = await parseSupplierList(lista.mensaje.texto);
      if (rows.length === 0) {
        avisos.push({
          proveedor: lista.proveedor.name,
          textos: ["No se encontró ningún equipo en el mensaje."],
        });
        continue;
      }

      interpretadas.push({
        proveedor: lista.proveedor,
        filas: rows,
        filasAnteriores: ultima.get(lista.proveedor.id)?.filas ?? [],
      });
      textoDe.set(lista.proveedor.id, lista.mensaje.texto);
      if (warnings.length > 0) {
        avisos.push({ proveedor: lista.proveedor.name, textos: warnings });
      }
    }

    const plan = planificarPublicacion(interpretadas, settings.dollarRate);

    /*
     * El plan viene por equipo y la escritura va por proveedor —cada uno con su
     * margen y su texto original—, así que se agrupa acá y no en la pantalla:
     * que el cliente arme los lotes sería darle a la UI la decisión de qué
     * margen se aplica a qué fila.
     */
    const porProveedor = new Map<string, LoteProveedor>();
    for (const { fila, proveedor } of plan.publicar) {
      let lote = porProveedor.get(proveedor.id);
      if (!lote) {
        lote = {
          proveedorId: proveedor.id,
          proveedorNombre: proveedor.name,
          marginPct: proveedor.defaultMarginPct,
          rawText: textoDe.get(proveedor.id) ?? "",
          filas: [],
        };
        porProveedor.set(proveedor.id, lote);
      }
      lote.filas.push(fila);
    }

    return {
      ok: true,
      data: {
        lotes: [...porProveedor.values()],
        frenadas: plan.frenadas.map((f) => ({
          proveedor: f.proveedor.name,
          revisiones: f.revisiones.map((r) => ({ motivo: r.motivo, detalle: r.detalle })),
        })),
        sinStock: plan.sinStock,
        dollarRate: settings.dollarRate,
        avisos,
        listasInterpretadas: interpretadas.length,
      },
    };
  } catch (err) {
    console.error("[whatsapp] planificar:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo armar el plan.",
    };
  }
}

/**
 * Prende el lector desde el panel, sin terminal.
 *
 * Esto arranca un proceso que **sobrevive al sitio**: `detached` lo saca del
 * grupo del padre y `unref()` suelta la referencia, así que sigue andando
 * cuando el servidor de desarrollo se reinicia o se cierra. Está verificado,
 * no supuesto.
 *
 * Por qué no es un agujero de seguridad, que es la pregunta razonable al ver a
 * una web lanzar procesos:
 *
 * - No recibe ningún parámetro. El ejecutable es el propio Node del proceso y
 *   el script es una ruta fija del repo. Nada que venga del cliente llega a la
 *   línea de comandos, así que no hay nada que inyectar.
 * - Exige sesión y rol admin, como toda acción del panel.
 * - Se niega en producción. Allá el lector vive en su propio servicio, siempre
 *   prendido, y el sistema de archivos de Vercel no sostiene un proceso: dejar
 *   que lo intente sería ofrecer un botón que no puede funcionar.
 *
 * La salida va a un archivo porque si no, un arranque fallido es invisible: el
 * proceso muere sin dejar nada y la pantalla solo sabe que nadie contesta.
 */
export async function arrancarLectorAction(): Promise<
  ActionResult<{ yaEstaba: boolean }>
> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };

  if (process.env.VERCEL) {
    return {
      ok: false,
      error:
        "En producción el lector corre en su propio servicio y queda prendido siempre. Este botón solo sirve en tu máquina.",
    };
  }

  if (!servidorConfigurado()) {
    return {
      ok: false,
      error: "Faltan WHATSAPP_SERVIDOR_URL y WHATSAPP_SERVIDOR_TOKEN en .env.local.",
    };
  }

  // Si ya hay uno andando, no se levanta un segundo: pelearían por el puerto y
  // por el directorio de sesión.
  const antes = await pedirSalud();
  if (antes.ok) return { ok: true, data: { yaEstaba: true } };

  try {
    const raiz = process.cwd();
    const puerto = new URL(process.env.WHATSAPP_SERVIDOR_URL!).port || "8080";
    const sesion = join(raiz, ".whatsapp-auth");
    mkdirSync(sesion, { recursive: true });

    /* Fuera de .whatsapp-auth: ese directorio se borra cuando un intento de
       vinculación no prospera, y se llevaba el registro justo cuando hacía
       falta leerlo para entender por qué falló. */
    const registro = openSync(join(raiz, "lector-whatsapp.log"), "a");

    const hijo = spawn(process.execPath, [join(raiz, "scripts/whatsapp/servidor.mjs")], {
      cwd: raiz,
      detached: true,
      stdio: ["ignore", registro, registro],
      env: {
        ...process.env,
        TOKEN_WHATSAPP: process.env.WHATSAPP_SERVIDOR_TOKEN,
        /*
         * La línea que se espera sale de la configuración del negocio, que es
         * donde ya estaba: el número que el sitio publica es el mismo que hay
         * que vincular. Pasarlo acá hace que el lector se niegue solo si
         * alguien escanea con otra cuenta, sin depender de que el panel lo
         * chequee después.
         */
        WHATSAPP_NUMERO: (await getSettings()).whatsappNumber,
        PORT: puerto,
        AUTH_DIR: sesion,
        DIAS: process.env.WHATSAPP_DIAS ?? "3",
      },
    });
    hijo.unref();

    /*
     * Se espera a que conteste en vez de devolver "lo lancé". Arrancar y
     * fallar al segundo es un caso corriente —puerto ocupado, sesión corrupta—
     * y en ese caso la pantalla mostraría un éxito que no pasó.
     */
    for (let intento = 0; intento < 24; intento++) {
      await new Promise((listo) => setTimeout(listo, 500));
      if ((await pedirSalud()).ok) {
        revalidatePath("/admin/whatsapp");
        return { ok: true, data: { yaEstaba: false } };
      }
    }

    return {
      ok: false,
      error:
        "El lector arrancó pero no contestó en 12 segundos. Mirá .whatsapp-auth/lector.log para ver qué dijo.",
    };
  } catch (err) {
    console.error("[whatsapp] arrancar lector:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo arrancar el lector.",
    };
  }
}

/**
 * El QR para vincular la línea, para mostrarlo en el panel.
 *
 * Existe porque la alternativa era peor: el QR se dibujaba en la terminal del
 * proceso, y en Railway eso significa ir a buscarlo a los logs del servicio.
 *
 * Caduca en segundos, así que la pantalla lo vuelve a pedir sola. El SVG llega
 * ya dibujado desde el lector: el string crudo es la credencial que vincula la
 * cuenta y no hace falta que pase por acá.
 */
export async function pedirQrAction(): Promise<
  ActionResult<{
    svg: string | null;
    codigo: string | null;
    codigoDesde: string | null;
    vinculado: boolean;
  }>
> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!servidorConfigurado()) {
    return { ok: false, error: "El lector de WhatsApp no está configurado." };
  }

  const r = await pedirQr();
  if (!r.ok) return { ok: false, error: r.detalle };
  return {
    ok: true,
    data: {
      svg: r.datos.svg,
      codigo: r.datos.codigo,
      codigoDesde: r.datos.codigoDesde,
      vinculado: r.datos.vinculado,
    },
  };
}

/**
 * Pide un código nuevo porque alguien lo decidió.
 *
 * Antes el lector lo renovaba solo cada vez que WhatsApp rotaba el QR, y era
 * peor de lo que parecía: el código cambiaba debajo de la persona mientras lo
 * escribía, y si el login ya había arrancado, pedir otro lo mataba. Ahora el
 * de pantalla se queda quieto y esto existe para cuando de verdad haga falta
 * otro.
 */
export async function pedirCodigoNuevoAction(): Promise<
  ActionResult<{ codigo: string | null; codigoDesde: string | null }>
> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!servidorConfigurado()) {
    return { ok: false, error: "El lector de WhatsApp no está configurado." };
  }
  const r = await pedirCodigoNuevo();
  if (!r.ok) return { ok: false, error: r.detalle };
  return { ok: true, data: r.datos };
}

/**
 * Quién es ese remitente, según lo que WhatsApp deje ver.
 *
 * El identificador no dice nada y la lista a veces tampoco trae el nombre.
 * Esto es el último recurso antes de preguntarle a una persona: el perfil de
 * negocio —descripción, rubro, dirección, sitio— y el estado del contacto,
 * donde muchos mayoristas escriben justamente a qué se dedican.
 */
export async function perfilDeContactoAction(
  id: string
): Promise<ActionResult<PerfilContacto>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!servidorConfigurado()) {
    return { ok: false, error: "El lector de WhatsApp no está configurado." };
  }
  const r = await pedirPerfil(id);
  if (!r.ok) return { ok: false, error: r.detalle };
  return { ok: true, data: r.datos };
}

const PublicarSchema = z.object({
  lotes: z
    .array(
      z.object({
        proveedorId: z.string().min(1),
        marginPct: z.number().min(0).max(300),
        rawText: z.string(),
        filas: z.array(ParsedRowSchema).min(1),
      })
    )
    .min(1, "No hay nada para publicar."),
  sinStock: z.array(z.string()),
  dollarRate: z.number().positive(),
});

export async function publicarPlanAction(
  input: z.input<typeof PublicarSchema>
): Promise<ActionResult<{ publicados: number; enCero: number }>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = PublicarSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { lotes, sinStock, dollarRate } = parsed.data;

  try {
    const supabase = createAdminClient();
    let publicados = 0;

    for (const lote of lotes) {
      publicados += await publicarFilas({
        supabase,
        supplierId: lote.proveedorId,
        marginPct: lote.marginPct,
        dollarRate,
        rows: lote.filas as ParsedRow[],
        rawText: lote.rawText,
      });
    }

    /*
     * Lo que dejó de ofrecerse va a stock cero, no se borra. Borrarlo perdería
     * el historial de precios y rompería cualquier venta que lo referencie; y
     * si el proveedor lo vuelve a ofrecer mañana, la variante ya está con su
     * SKU y su historia.
     */
    let enCero = 0;
    if (sinStock.length > 0) {
      const skus = sinStock.map(skuDesdeClave);
      const { data, error } = await supabase
        .from("product_variants")
        .update({ stock: 0 })
        .in("sku", skus)
        .select("id");
      if (error) throw new Error(error.message);
      enCero = data?.length ?? 0;
    }

    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/whatsapp");
    revalidatePath("/admin");

    return { ok: true, data: { publicados, enCero } };
  } catch (err) {
    console.error("[whatsapp] publicar plan:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo publicar el plan.",
    };
  }
}
