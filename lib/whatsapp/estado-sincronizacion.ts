import type { Supplier } from "@/types";

export type EstadoProveedor = "al-dia" | "lista-nueva" | "borrador" | "sin-listas";

export interface ImportacionResumen {
  proveedorId: string | null;
  fecha: string;
  estado: string;
  publicados: number;
}

export interface FilaSincronizacion {
  proveedor: Supplier;
  estado: EstadoProveedor;
  /** Última lista que se vio en sus chats. */
  ultimaLectura: string | null;
  /** Última lista aprobada y pasada al catálogo. */
  ultimaImportacion: string | null;
  /** Equipos del catálogo que hoy salen de este proveedor. */
  publicados: number;
}

/** Una lista más vieja que esto ya no es una novedad para importar. */
const DIAS_VIGENCIA = 10;

/** Como instante: el lector escribe "…00.000Z" y la base "…00+00:00". */
const t = (iso: string) => Date.parse(iso);

/**
 * Qué tan al día está cada proveedor.
 *
 * Una lista vista después de la última importación pesa más que un borrador:
 * un borrador ya viejo no sirve si el proveedor volvió a publicar.
 */
export function armarSincronizacion(
  proveedores: Supplier[],
  importaciones: ImportacionResumen[],
  lecturas: ReadonlyMap<string, string>,
  publicados: ReadonlyMap<string, number>,
  ahora: Date
): FilaSincronizacion[] {
  const orden: Record<EstadoProveedor, number> = {
    "lista-nueva": 0,
    borrador: 1,
    "sin-listas": 2,
    "al-dia": 3,
  };
  const ultima = (id: string, aprobada: boolean) =>
    importaciones
      .filter((i) => i.proveedorId === id && (i.estado === "approved") === aprobada)
      .reduce<string | null>((m, i) => (!m || t(i.fecha) > t(m) ? i.fecha : m), null);

  return proveedores
    .filter((p) => p.isActive)
    .map((proveedor) => {
      const ultimaImportacion = ultima(proveedor.id, true);
      const borrador = ultima(proveedor.id, false);
      const ultimaLectura = lecturas.get(proveedor.id) ?? null;
      const referencia = Math.max(
        ultimaImportacion ? t(ultimaImportacion) : 0,
        borrador ? t(borrador) : 0
      );
      const vigente =
        ultimaLectura !== null &&
        ahora.getTime() - t(ultimaLectura) <= DIAS_VIGENCIA * 86_400_000;

      let estado: EstadoProveedor;
      if (vigente && t(ultimaLectura) > referencia) estado = "lista-nueva";
      else if (borrador && (!ultimaImportacion || t(borrador) > t(ultimaImportacion)))
        estado = "borrador";
      else estado = ultimaImportacion ? "al-dia" : "sin-listas";

      return {
        proveedor,
        estado,
        ultimaLectura,
        ultimaImportacion,
        publicados: publicados.get(proveedor.id) ?? 0,
      };
    })
    .sort((a, b) => orden[a.estado] - orden[b.estado] || b.publicados - a.publicados);
}
