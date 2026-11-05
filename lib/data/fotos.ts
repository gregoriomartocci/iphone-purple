import { FOTOS_PRODUCTO, type CreditoFoto } from "./fotos.generado";

/**
 * Los datos de una foto a partir de su dirección.
 *
 * La base guarda la dirección sin el ?v=, no siempre tiene todas las fotos de
 * la carpeta y la carpeta no siempre se llama como el producto. Por eso se
 * busca por archivo, y no por posición ni por slug.
 */
const POR_ARCHIVO = new Map(
  Object.values(FOTOS_PRODUCTO)
    .flat()
    .map((foto) => [foto.url.split("?")[0], foto])
);

export function fotoDe(url: string): CreditoFoto | undefined {
  return POR_ARCHIVO.get(url.split("?")[0]);
}
