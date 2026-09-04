export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Dólares, escritos "US$".
 *
 * No se usa el formato de moneda de Intl, que devuelve "$840": acá el signo
 * `$` solo es pesos, y ese número puesto debajo de "$ 1.218.000" se lee como
 * un descuento absurdo en vez de como el precio en otra moneda. El separador
 * de miles va en formato argentino por el mismo motivo: quien lee está
 * acostumbrado al punto.
 */
export function formatUSD(amount: number): string {
  const numero = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `US$ ${numero}`;
}

/**
 * Convierte un texto en un slug apto para URL.
 *
 * El orden importa: hay que recortar los extremos ANTES de pasar los espacios a
 * guiones, o " iPhone 15 " termina como "-iphone-15-". No es teórico: los modelos
 * llegan desde listas de WhatsApp, que vienen llenas de espacios de más.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatOrderNumber(num: string): string {
  return `#${num}`;
}

export function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "justo ahora";
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}
