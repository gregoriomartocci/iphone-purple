/**
 * Moneda y cotización.
 *
 * El sitio muestra siempre los pesos grandes y los dólares abajo, en chico.
 * Hubo un selector para poner los dólares adelante y se sacó: obligaba a elegir
 * algo que no hace falta elegir, y con los dos números a la vista nadie lee
 * "US$ 950" como novecientos cincuenta pesos.
 */

/**
 * Hace cuánto se actualizó la cotización, en palabras.
 *
 * Se muestra al lado del precio porque un dólar de hace tres semanas es peor
 * que no mostrar ninguno: el número parece firme y no lo es. Diciendo cuándo
 * se tocó, quien mira decide cuánto confiar.
 */
export function antiguedadCotizacion(fechaIso: string, ahora = new Date()): string {
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return "";

  const dias = Math.floor((ahora.getTime() - fecha.getTime()) / 86_400_000);
  if (dias <= 0) return "actualizada hoy";
  if (dias === 1) return "actualizada ayer";
  if (dias < 7) return `actualizada hace ${dias} días`;
  if (dias < 14) return "actualizada hace una semana";
  if (dias < 31) return `actualizada hace ${Math.floor(dias / 7)} semanas`;
  return "actualizada hace más de un mes";
}
