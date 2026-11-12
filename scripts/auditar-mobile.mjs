/**
 * Recorre el sitio en varios anchos de pantalla y avisa si algo se sale.
 *
 * Existe porque el mismo error apareció dos veces sin que nadie lo viera: una
 * galería con muchas miniaturas estiraba la columna y la ficha del iPhone 13
 * y la del 16 quedaban más anchas que el teléfono. A ojo se revisa una ficha;
 * esto revisa todas, en todos los anchos.
 *
 * Un elemento cuenta como problema si se pasa del borde derecho y ningún
 * contenedor lo recorta. Las tiras que se deslizan a propósito —la galería,
 * las fotos de la tarjeta— están dentro de un contenedor con overflow y no
 * cuentan.
 *
 * Uso:
 *   npm run auditar:mobile                         contra el sitio en vivo
 *   BASE=http://localhost:3000 npm run auditar:mobile
 *
 * Sale con código 1 si encuentra algo, para poder usarlo antes de publicar.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "https://iphonepurple.com.ar";
const ANCHOS_PAGINAS = [320, 360, 390, 430, 768, 1024, 1440];
const ANCHOS_FICHAS = [320, 390, 768];
const PAGINAS = [
  "/",
  "/catalogo",
  "/plan-canje",
  "/reparaciones",
  "/contacto",
  "/cuenta",
  "/login",
];

const browser = await chromium.launch();
const problemas = [];

async function revisar(page, ruta, ancho) {
  const r = await page.goto(BASE + ruta, { waitUntil: "networkidle" });
  if (!r || r.status() >= 400) {
    problemas.push(`${ruta} @${ancho}: respondió ${r?.status()}`);
    return;
  }
  const fuera = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const recortado = (el) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const o = getComputedStyle(a).overflowX;
        if (o !== "visible" && a.getBoundingClientRect().right <= W + 1) return true;
      }
      return false;
    };
    const malos = [];
    for (const el of document.body.querySelectorAll("*")) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.right <= W + 1) continue;
      if (getComputedStyle(el).position === "fixed" || recortado(el)) continue;
      malos.push(
        `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} (${Math.round(b.right - W)} px)`
      );
      if (malos.length >= 2) break;
    }
    return { scroll: document.documentElement.scrollWidth - W, malos };
  });
  if (fuera.scroll > 0 || fuera.malos.length) {
    problemas.push(
      `${ruta} @${ancho}: se sale ${fuera.scroll} px · ${fuera.malos.join(" | ")}`
    );
  }
}

const contexto = (ancho) =>
  browser.newContext({
    viewport: { width: ancho, height: 900 },
    isMobile: ancho < 1024,
    hasTouch: ancho < 1024,
  });

for (const ancho of ANCHOS_PAGINAS) {
  const page = await (await contexto(ancho)).newPage();
  for (const ruta of PAGINAS) await revisar(page, ruta, ancho);
}

const lista = await (await contexto(390)).newPage();
await lista.goto(`${BASE}/catalogo?stock=todos`, { waitUntil: "networkidle" });
const fichas = [
  ...new Set(
    await lista.$$eval('a[href^="/catalogo/"]', (as) =>
      as.map((a) => a.getAttribute("href").split(/[?#]/)[0])
    )
  ),
];

for (const ancho of ANCHOS_FICHAS) {
  const page = await (await contexto(ancho)).newPage();
  for (const ruta of fichas) await revisar(page, ruta, ancho);
}

await browser.close();
console.log(
  `${PAGINAS.length} páginas en ${ANCHOS_PAGINAS.length} anchos y ${fichas.length} fichas en ${ANCHOS_FICHAS.length} anchos.`
);
if (problemas.length) {
  console.log(`\n${problemas.length} problemas:\n` + problemas.join("\n"));
  process.exit(1);
}
console.log("Nada se sale de la pantalla.");
