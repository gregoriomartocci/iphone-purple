import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";
import { fotoPrincipal } from "@/lib/fotos";
import { PRODUCTS } from "@/lib/data/seed";

/**
 * Integridad del índice de fotos contra el disco.
 *
 * El índice es un archivo generado que el sitio lee para saber qué mostrar, y
 * el disco es la verdad. Cuando divergen, el resultado es una imagen rota en
 * producción: el optimizador de Next responde 400 y el navegador dibuja el
 * ícono de imagen cortada. Pasó con el carrito, que guardaba la URL y se
 * quedaba con una foto que ya se había descartado.
 *
 * Estos tests son baratos —leen el directorio— y cierran esa clase entera de
 * error antes de que llegue a un deploy.
 */

const RAIZ = path.join(process.cwd(), "public", "productos");

/** La ruta en disco de una URL del índice, sin el ?v= de caché. */
function archivoDe(url: string): string {
  return path.join(process.cwd(), "public", url.split("?")[0].replace(/^\//, ""));
}

describe("índice de fotos", () => {
  it("cada foto del índice existe en el disco", () => {
    const faltantes: string[] = [];
    for (const [slug, fotos] of Object.entries(FOTOS_PRODUCTO)) {
      for (const f of fotos) {
        if (!existsSync(archivoDe(f.url))) faltantes.push(`${slug} → ${f.url}`);
      }
    }
    expect(faltantes).toEqual([]);
  });

  it("cada archivo del disco está en el índice", () => {
    // Al revés que el anterior: detecta que alguien dejó una foto en la
    // carpeta y se olvidó de correr `npm run fotos:indexar`, con lo cual el
    // catálogo no la muestra y nadie se entera.
    const enIndice = new Set(
      Object.values(FOTOS_PRODUCTO).flatMap((fotos) =>
        fotos.map((f) => f.url.split("?")[0])
      )
    );
    const huerfanos: string[] = [];
    for (const slug of readdirSync(RAIZ)) {
      const dir = path.join(RAIZ, slug);
      for (const archivo of readdirSync(dir)) {
        // Los sidecars de crédito y color no son fotos.
        if (archivo.startsWith(".")) continue;
        const url = `/productos/${slug}/${archivo}`;
        if (!enIndice.has(url)) huerfanos.push(url);
      }
    }
    expect(huerfanos).toEqual([]);
  });

  it("el ?v= de cada foto coincide con el contenido del archivo", () => {
    // Si no coincide, el índice quedó viejo: el archivo cambió y no se
    // reindexó. Entonces el navegador sirve de caché la foto anterior, que es
    // justo lo que el hash viene a evitar.
    const desfasadas: string[] = [];
    for (const fotos of Object.values(FOTOS_PRODUCTO)) {
      for (const f of fotos) {
        const [ruta, query] = f.url.split("?");
        const esperado = createHash("md5")
          .update(readFileSync(archivoDe(f.url)))
          .digest("hex")
          .slice(0, 8);
        if (query !== `v=${esperado}`) desfasadas.push(`${ruta} (${query})`);
      }
    }
    expect(desfasadas).toEqual([]);
  });
});

describe("fotoPrincipal", () => {
  it("devuelve la primera foto del producto", () => {
    const slug = "iphone-17-pro";
    expect(fotoPrincipal(slug)).toBe(FOTOS_PRODUCTO[slug][0].url);
  });

  it("nunca devuelve un video: en un recuadro chico no se reproduce", () => {
    for (const [slug, fotos] of Object.entries(FOTOS_PRODUCTO)) {
      const elegida = fotoPrincipal(slug);
      if (elegida === null) continue;
      expect(fotos.find((f) => f.url === elegida)?.video).toBe(false);
    }
  });

  it("devuelve null para un producto que no existe, sin romper", () => {
    expect(fotoPrincipal("nokia-3310")).toBeNull();
  });

  /**
   * Es lo que sostiene al carrito: guarda el slug y resuelve la foto al
   * mostrarla, así que mientras el slug exista tiene que haber foto o null,
   * nunca una ruta que no se puede servir.
   */
  it("lo que devuelve para cualquier producto del catálogo se puede servir", () => {
    const rotas: string[] = [];
    for (const p of PRODUCTS) {
      const url = fotoPrincipal(p.slug);
      if (url !== null && !existsSync(archivoDe(url))) rotas.push(`${p.slug} → ${url}`);
    }
    expect(rotas).toEqual([]);
  });
});
