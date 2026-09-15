import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";

/**
 * La foto que representa a un producto, resuelta en el momento de mostrarla.
 *
 * Existe por el carrito. El carrito vive en localStorage y puede quedar ahí
 * semanas; si guardara la URL de la foto, esa URL envejece: una foto que se
 * reemplaza corre de 1.jpg a 2.jpg, una que se descarta desaparece, y el
 * archivo al que apuntaba deja de existir. El navegador entonces muestra el
 * ícono de imagen rota, y el optimizador de Next responde 400. Pasó de
 * verdad: se descartaron diecisiete fotos en una semana y los carritos
 * abiertos quedaron con el recuadro roto.
 *
 * Guardar el slug y resolver acá lo vuelve inmune: el carrito siempre muestra
 * la foto que el catálogo tiene hoy, y si el producto se quedó sin fotos
 * devuelve null y quien llama dibuja un marcador de posición en vez de una
 * imagen rota.
 *
 * Los videos no cuentan: en un recuadro de ochenta píxeles no se reproducen,
 * y un <img> apuntando a un .mp4 no dibuja nada.
 */
export function fotoPrincipal(slug: string): string | null {
  const fotos = FOTOS_PRODUCTO[slug];
  return fotos?.find((f) => !f.video)?.url ?? null;
}
