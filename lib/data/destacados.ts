/**
 * Selección curada de equipos para la portada.
 *
 * No se calcula: se elige. Con un catálogo de este tamaño, "lo más vendido"
 * sale de lo que efectivamente se mueve en el mostrador, y eso lo sabe el
 * local, no una consulta. Además evita el problema de arranque, donde sin
 * ventas registradas la portada quedaría vacía o mostrando cualquier cosa.
 *
 * El orden de cada lista es el orden en que se muestran. Para cambiar la
 * portada alcanza con reordenar estos slugs.
 *
 * Los slugs que no existan o estén sin stock se descartan solos, así que una
 * lista desactualizada nunca rompe la página: como mucho muestra menos.
 */

/** Los que más salen. El primero lleva la etiqueta destacada en el catálogo. */
export const MAS_VENDIDOS = [
  "iphone-17-pro",
  "iphone-14-pro-max",
  "iphone-13",
  "iphone-16",
  "iphone-15-pro",
  "iphone-12",
] as const;

/**
 * Los que mejor rinden por lo que cuestan: generaciones anteriores que siguen
 * andando igual de bien y cuestan bastante menos que el modelo del año.
 */
export const CALIDAD_PRECIO = [
  "iphone-14-pro-max",
  "iphone-13-pro",
  "iphone-13-pro-max",
  "iphone-12-pro",
  "iphone-11-pro",
] as const;

/**
 * Equipos que llevan la etiqueta "Más vendido" en la tarjeta.
 *
 * Es un Set y no la lista entera: la etiqueta pierde sentido si la tienen
 * todos, así que la llevan solo los tres primeros.
 */
export const CON_ETIQUETA_VENDIDO: ReadonlySet<string> = new Set(
  MAS_VENDIDOS.slice(0, 3)
);
