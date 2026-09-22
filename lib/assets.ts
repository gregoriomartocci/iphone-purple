import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * La ruta de un archivo de `public/` con el hash de su contenido pegado.
 *
 * Las fotos del catálogo ya lo traen porque las escribe el indexador, y existe
 * por una razón concreta: el navegador, el CDN y el optimizador de imágenes
 * cachean por URL, así que cambiar el contenido de un archivo sin cambiarle el
 * nombre deja a quien ya lo vio mirando el anterior. Pasó con las fotos de
 * producto y volvió a pasar con la banda del Plan Canje: se reemplazó la foto,
 * se publicó, y del otro lado seguía la vieja.
 *
 * Lo mismo, entonces, para lo que vive suelto en `public/`. El hash se calcula
 * una vez por archivo y queda en memoria: en producción esto corre al construir
 * las páginas, no por visita.
 *
 * Solo servidor: lee del disco. Un componente de cliente que necesite una de
 * estas rutas la recibe por props.
 */
const cache = new Map<string, string>();

export function versionado(ruta: string): string {
  let v = cache.get(ruta);
  if (v === undefined) {
    try {
      const buf = readFileSync(path.join(process.cwd(), "public", ruta));
      v = createHash("md5").update(buf).digest("hex").slice(0, 8);
    } catch {
      // Si el archivo no está, se devuelve la ruta tal cual: una foto sin
      // versionar es un problema menor que una página que no construye.
      v = "";
    }
    cache.set(ruta, v);
  }
  return v ? `/${ruta}?v=${v}` : `/${ruta}`;
}
