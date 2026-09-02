/**
 * Armado de links a WhatsApp.
 *
 * Toda la conversión del sitio pasa por acá: el cliente no compra online, hace
 * clic y arranca un chat con el mensaje ya escrito. Que el mensaje llegue con el
 * equipo puesto es lo que evita el ida y vuelta de "¿cuál era?".
 */

/** wa.me solo acepta dígitos: sin +, sin espacios, sin guiones. */
function normalizeNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function waLink(number: string, message?: string): string {
  const base = `https://wa.me/${normalizeNumber(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productMessage(name: string, variant?: string): string {
  const what = variant ? `${name} (${variant})` : name;
  return `¡Hola! Me interesa el ${what} que vi en la web. ¿Sigue disponible?`;
}

export function repairMessage(service: string, device?: string): string {
  return device
    ? `¡Hola! Quería consultar por ${service.toLowerCase()} para un ${device}.`
    : `¡Hola! Quería consultar por ${service.toLowerCase()}.`;
}

export function tradeInMessage(
  device: string,
  grade: string,
  estimate: string,
  wanted?: string
): string {
  const lines = [
    "¡Hola! Coticé mi equipo en la web:",
    `• Equipo: ${device}`,
    `• Estado: ${grade}`,
    `• Estimado: ${estimate}`,
  ];
  if (wanted) lines.push(`• Me interesa llevarme: ${wanted}`);
  lines.push("", "¿Coordinamos para verlo?");
  return lines.join("\n");
}

export const GENERAL_MESSAGE = "¡Hola! Quería hacerles una consulta.";
