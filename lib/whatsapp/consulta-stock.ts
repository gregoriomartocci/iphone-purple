import type { EquipoMercado, OfertaMercado } from "./mercado";

/*
 * Aparte de `mercado.ts` porque esto corre en el navegador, y aquel importa el
 * intérprete de listas, que usa node:child_process.
 */

/**
 * Un identificador interno de WhatsApp no es un teléfono: un enlace wa.me armado
 * con él abriría un chat con nadie.
 */
export function esTelefonoReal(valor: string | null): boolean {
  const d = (valor ?? "").replace(/\D/g, "");
  if (d.startsWith("54")) return d.length === 12 || d.length === 13;
  return d.length === 10 || d.length === 11;
}

export function mensajeDeStock(equipo: EquipoMercado, oferta: OfertaMercado): string {
  const moneda = oferta.moneda === "USD" ? "USD" : "$";
  const que = [
    equipo.modelo,
    equipo.capacidad,
    equipo.grado === "sellado" ? "sellado" : null,
  ]
    .filter(Boolean)
    .join(" ");
  return `Hola! ¿Tenés stock de ${que} a ${moneda} ${oferta.costo}? Gracias!`;
}
