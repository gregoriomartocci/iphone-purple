/**
 * Regenera las capturas del README.
 *
 * Uso:
 *   npm run build && PORT=3187 npm start &
 *   AUTH_SECRET=$(grep ^AUTH_SECRET= .env.local | cut -d= -f2-) npm run screenshots
 *
 * Para fotografiar el panel hace falta una sesión, así que se firma un JWT de
 * admin local con el AUTH_SECRET del proyecto. Es solo para este script: no crea
 * ningún usuario ni toca la base.
 */
import { chromium } from "playwright";
import { encode } from "next-auth/jwt";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3187";
const OUT = process.env.OUT ?? "docs/screenshots";
fs.mkdirSync(OUT, { recursive: true });

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("Falta AUTH_SECRET");

// Sesión de admin local, solo para poder fotografiar el panel.
const token = await encode({
  token: { sub: "demo-admin", name: "Demo", email: "demo@local", role: "admin" },
  secret,
  salt: "authjs.session-token",
});

const browser = await chromium.launch();

const DESKTOP = [
  ["01-home", "/"],
  ["02-catalogo", "/catalogo"],
  ["03-catalogo-filtrado", "/catalogo?q=iphone+15&sort=precio-asc"],
  ["04-producto", "/catalogo/iphone-15-pro"],
  ["05-plan-canje", "/plan-canje"],
  ["06-reparaciones", "/reparaciones"],
  ["07-blog", "/blog"],
  ["08-contacto", "/contacto"],
];

const ADMIN = [
  ["09-admin-resumen", "/admin"],
  ["10-admin-importar", "/admin/importar"],
  ["11-admin-productos", "/admin/productos"],
];

const MOBILE = [
  ["m1-home", "/"],
  ["m2-catalogo", "/catalogo"],
  ["m3-producto", "/catalogo/iphone-15-pro"],
];

async function shoot(ctx, name, url, fullPage) {
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 45000 });
  // Deja asentar fuentes e imágenes antes de disparar.
  await page.waitForTimeout(700);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage });
  console.log("✓", file);
  await page.close();
}

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
for (const [name, url] of DESKTOP) await shoot(desktop, name, url, false);

await desktop.addCookies([{ name: "authjs.session-token", value: token, url: BASE }]);
for (const [name, url] of ADMIN) await shoot(desktop, name, url, false);
await desktop.close();

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
for (const [name, url] of MOBILE) await shoot(mobile, name, url, false);
await mobile.close();

await browser.close();
console.log("listo");
