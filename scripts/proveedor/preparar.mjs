/**
 * Prepara una carpeta de fotos de proveedor para que se pueda revisar.
 *
 * El material que llega por WhatsApp no se puede usar tal cual: viene con
 * duplicados exactos —de 80 fotos, 27 eran la misma repetida—, con videos que
 * hay que mirar para saber de qué equipo son, y sin ningún nombre que diga
 * qué es cada archivo.
 *
 * Esto no decide nada. Solo deja el material en condiciones de ser mirado:
 *
 *   1. Descarta duplicados por hash del contenido, no por nombre.
 *   2. Achica cada foto a algo que se pueda revisar rápido.
 *   3. De cada video saca cuatro cuadros del medio y arma una tira, porque el
 *      primer cuadro casi nunca muestra el equipo.
 *   4. Escribe un mapa.tsv que ata cada miniatura a su archivo original.
 *
 * Después se miran las miniaturas, se decide qué va a qué producto, y eso se
 * escribe en un mapeo que aplica `aplicar.mjs`.
 *
 * Uso: npm run proveedor:preparar fotos-proveedor/<carpeta>
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const origen = process.argv[2];
if (!origen) {
  console.error(
    "Falta la carpeta. Ej: npm run proveedor:preparar fotos-proveedor/agosto"
  );
  process.exit(1);
}

const SALIDA = path.join(origen, ".revision");
const FOTOS = /\.(jpe?g|png|webp|heic)$/i;
const VIDEOS = /\.(mp4|mov|webm)$/i;

/** El extractor de cuadros se compila una sola vez y queda al lado. */
const fuente = path.join(process.cwd(), "scripts", "proveedor", "cuadros.swift");
const binario = path.join(SALIDA, "cuadros");

await rm(SALIDA, { recursive: true, force: true });
await mkdir(path.join(SALIDA, "fotos"), { recursive: true });
await mkdir(path.join(SALIDA, "videos"), { recursive: true });

execFileSync("swiftc", ["-O", fuente, "-o", binario]);

const archivos = (await readdir(origen)).sort();
const vistos = new Set();
const mapa = [];
let nf = 0;
let nv = 0;
let duplicados = 0;

for (const nombre of archivos) {
  const completo = path.join(origen, nombre);
  const esFoto = FOTOS.test(nombre);
  const esVideo = VIDEOS.test(nombre);
  if (!esFoto && !esVideo) continue;

  // Por contenido: WhatsApp reenvía el mismo archivo con fechas distintas.
  const hash = createHash("md5")
    .update(await readFile(completo))
    .digest("hex");
  if (vistos.has(hash)) {
    duplicados++;
    continue;
  }
  vistos.add(hash);

  if (esFoto) {
    const id = `f${String(++nf).padStart(3, "0")}`;
    await sharp(completo)
      .rotate()
      .resize(640, 640, { fit: "inside" })
      .jpeg({ quality: 76 })
      .toFile(path.join(SALIDA, "fotos", `${id}.jpg`));
    mapa.push([id, "foto", nombre]);
  } else {
    const id = `v${String(++nv).padStart(3, "0")}`;
    const prefijo = path.join(SALIDA, "videos", id);
    execFileSync(binario, [completo, prefijo]);

    // Los cuadros se pegan en una tira: se lee de un vistazo si el equipo se
    // llega a ver y de qué modelo es, sin abrir cuatro archivos.
    const cuadros = (await readdir(path.join(SALIDA, "videos")))
      .filter((f) => f.startsWith(`${id}-`))
      .sort();
    if (cuadros.length > 0) {
      const bufs = [];
      for (const c of cuadros) {
        bufs.push(
          await sharp(path.join(SALIDA, "videos", c))
            .resize({ height: 400, fit: "inside" })
            .toBuffer()
        );
      }
      const metas = await Promise.all(bufs.map((b) => sharp(b).metadata()));
      const ancho = metas.reduce((a, m) => a + m.width, 0);
      const alto = Math.max(...metas.map((m) => m.height));
      let x = 0;
      const capas = bufs.map((input, i) => {
        const capa = { input, left: x, top: 0 };
        x += metas[i].width;
        return capa;
      });
      await sharp({
        create: { width: ancho, height: alto, channels: 3, background: "#fff" },
      })
        .composite(capas)
        .jpeg({ quality: 76 })
        .toFile(path.join(SALIDA, "videos", `${id}-tira.jpg`));
      for (const c of cuadros) await rm(path.join(SALIDA, "videos", c));
    }
    mapa.push([id, "video", nombre]);
  }
}

await writeFile(
  path.join(SALIDA, "mapa.tsv"),
  mapa.map((f) => f.join("\t")).join("\n") + "\n",
  "utf8"
);

console.log(
  `${nf} fotos y ${nv} videos únicos en ${SALIDA} (${duplicados} duplicados descartados).`
);
console.log(`El mapa de miniatura → archivo original está en ${SALIDA}/mapa.tsv`);
