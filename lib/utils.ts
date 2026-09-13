import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Si un color es claro, para saber de qué color va el tilde encima de la
 * muestra. Luminancia percibida: el ojo pesa mucho más el verde que el azul.
 */
export function esClaro(hex?: string): boolean {
  if (!hex) return true;
  const m = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
