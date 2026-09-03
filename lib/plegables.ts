/**
 * Estado de apertura de las secciones plegables del filtro.
 *
 * Vive fuera del componente porque la lógica tiene un caso que es fácil
 * escribir mal: una sección arranca abierta o cerrada según si ya tiene una
 * opción elegida, y ese valor inicial no está guardado en ningún lado. Al
 * alternar hay que partir de lo que se está viendo, no de la regla que definió
 * el arranque.
 *
 * El bug que motivó esto: al tocar una sección que nunca se había tocado, se
 * guardaba el mismo estado en el que ya estaba, así que el primer clic no
 * hacía nada y había que tocar dos veces.
 */
export type Plegadas = Record<string, boolean>;

/** Si una sección se está mostrando abierta. */
export function estaAbierta(
  plegadas: Plegadas,
  clave: string,
  tieneValor: boolean
): boolean {
  // Sin registro, la regla de arranque: abierta mientras no haya elección.
  return plegadas[clave] === undefined ? !tieneValor : !plegadas[clave];
}

/**
 * Alterna una sección.
 *
 * Guarda "cerrada = lo que estaba abierta": si se ve abierta, se cierra; si se
 * ve cerrada, se abre. Partir del estado visible y no de `tieneValor` es lo
 * que arregla el primer clic sin efecto.
 */
export function alternar(
  plegadas: Plegadas,
  clave: string,
  tieneValor: boolean
): Plegadas {
  return { ...plegadas, [clave]: estaAbierta(plegadas, clave, tieneValor) };
}
