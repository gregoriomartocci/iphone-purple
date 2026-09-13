/**
 * Qué réplica imita a qué original del catálogo.
 *
 * La etiqueta "Original" no va en todos los productos: en un iPhone o una
 * MacBook nadie duda de que sea original, y repetirlo setenta veces lo vuelve
 * sospechoso. Va solo donde hace falta, que es donde el local vende también
 * la réplica: quien mira los AirPods Pro 2 y sabe que hay unos "estilo
 * AirPods" a un cuarto del precio quiere leer cuál es cuál.
 *
 * Una réplica que no tiene su original en el catálogo —el smartwatch estilo
 * Ultra— lleva igual su etiqueta de réplica, porque eso sale de la variante;
 * pero no figura acá, porque no hay a quién señalar como original.
 *
 * Curado a mano, como los destacados: es una relación comercial, no un dato
 * del producto, y con dos entradas no justifica una columna en la base.
 */
export const REPLICA_DE: Record<string, string> = {
  "auriculares-estilo-airpods-pro": "airpods-pro-2",
};

/** Originales que tienen una réplica a la venta: los únicos que dicen "Original". */
export const IMITADOS: ReadonlySet<string> = new Set(Object.values(REPLICA_DE));
