import type { ParsedRow } from "@/types";

/**
 * Un mismo equipo escrito de dos maneras se toma como dos productos: no se
 * compara y sale dos veces en el catálogo, cada una con su precio.
 *
 * Solo se unifica lo que se sabe que es lo mismo. Lo que puede ser otro equipo
 * queda como está: el Galaxy A17 tiene versión 4G y 5G, así que ese "5G" no se
 * saca. Una fila de más se ve y se corrige; dos equipos distintos unidos
 * venderían uno por otro.
 */
const REGLAS: [RegExp, string][] = [
  // Apple las vende como 13", 15", 14" y 16"; la medida exacta es de la pantalla.
  [
    /^mac\s*book air 13(?:[.,]6)?(?:"|”|''|\s*pulgadas|\s*pulg)?(?=\s|$)/i,
    'MacBook Air 13"',
  ],
  [
    /^mac\s*book air 15(?:[.,]3)?(?:"|”|''|\s*pulgadas|\s*pulg)?(?=\s|$)/i,
    'MacBook Air 15"',
  ],
  [
    /^mac\s*book pro 14(?:[.,]2)?(?:"|”|''|\s*pulgadas|\s*pulg)?(?=\s|$)/i,
    'MacBook Pro 14"',
  ],
  [
    /^mac\s*book pro 16(?:[.,]2)?(?:"|”|''|\s*pulgadas|\s*pulg)?(?=\s|$)/i,
    'MacBook Pro 16"',
  ],
  [/^(?:samsung\s+)?galaxy\s+/i, "Samsung Galaxy "],
  [/^(Samsung Galaxy .*?)\s+(?:dual\s*sim|ds)$/i, "$1"],
  // Estos solo existen en 5G.
  [/^(Samsung Galaxy (?:A37|A56|A57|S\d+(?: \S+)?|Z \S+(?: \d+)?))\s+5G$/i, "$1"],
  [
    /^(?:cargador|adaptador)(?: de corriente)?(?: apple)? usb-?c(?: de)? 20\s?w$/i,
    "Cargador Apple USB-C 20W",
  ],
];

export function modeloCanonico(modelo: string): string {
  return REGLAS.reduce(
    (nombre, [patron, reemplazo]) => nombre.replace(patron, reemplazo),
    modelo.trim().replace(/\s+/g, " ")
  );
}

export function canonizarFila<T extends ParsedRow>(fila: T): T {
  return { ...fila, model: modeloCanonico(fila.model) };
}
