// Genera lib/supabase/seed.sql a partir de lib/data/seed.ts,
// para que la semilla de demo y la de Postgres nunca se desincronicen.
import {
  PRODUCTS,
  REPAIR_SERVICES,
  TRADE_IN_PRICES,
  POSTS,
  SUPPLIERS,
  SETTINGS,
} from "../lib/data/seed.ts";

const q = (v) =>
  v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`;
const n = (v) => (v === null || v === undefined ? "NULL" : String(v));
const b = (v) => (v ? "TRUE" : "FALSE");
const j = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

const out = [];
out.push(`-- iPhone Purple — datos de ejemplo
-- Generado desde lib/data/seed.ts. Aplicar DESPUÉS de schema.sql.
-- Es idempotente: se puede correr varias veces sin duplicar nada.

BEGIN;
`);

// ---- ajustes
out.push(`-- Ajustes de la tienda`);
for (const [key, value] of Object.entries(SETTINGS)) {
  out.push(
    `INSERT INTO store_settings (key, value) VALUES (${q(key)}, ${j(value)})\n  ON CONFLICT (key) DO NOTHING;`
  );
}
out.push("");

// ---- proveedores
out.push(`-- Proveedores`);
for (const s of SUPPLIERS) {
  out.push(
    `INSERT INTO suppliers (name, phone, default_margin_pct, is_active)\n  SELECT ${q(s.name)}, ${q(s.phone)}, ${n(s.defaultMarginPct)}, ${b(s.isActive)}\n  WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = ${q(s.name)});`
  );
}
out.push("");

// ---- productos + variantes + imágenes
out.push(`-- Catálogo`);
for (const p of PRODUCTS) {
  out.push(`INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES (${q(p.name)}, ${q(p.slug)}, ${q(p.brand)}, ${q(p.model)}, ${q(p.category)}, ${q(p.description)}, ${j(p.specs)}, 'active', ${b(p.isFeatured)})
  ON CONFLICT (slug) DO NOTHING;`);

  for (const img of p.images) {
    out.push(`INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, ${q(img.url)}, ${q(img.alt)}, 0 FROM products WHERE slug = ${q(p.slug)}
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = ${q(p.slug)} AND pi.url = ${q(img.url)});`);
  }

  for (const v of p.variants) {
    out.push(`INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, ${q(v.storage)}, ${q(v.color)}, ${q(v.colorHex)}, ${q(v.grade)}, ${q(v.authenticity)}, ${n(v.batteryHealth)}, ${n(v.priceArs)}, ${n(v.priceUsd)}, ${n(v.costUsd)}, ${n(v.stock)}, ${q(v.sku)}
  FROM products WHERE slug = ${q(p.slug)}
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = ${q(v.sku)});`);
  }
  out.push("");
}

// ---- reparaciones
out.push(`-- Servicios de reparación`);
REPAIR_SERVICES.forEach((s, i) => {
  out.push(`INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT ${q(s.name)}, ${q(s.device)}, ${q(s.description)}, ${n(s.priceFrom)}, ${q(s.duration)}, ${i}, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = ${q(s.name)});`);
});
out.push("");

// ---- valores de canje
out.push(`-- Valores de referencia del Plan Canje`);
for (const t of TRADE_IN_PRICES) {
  out.push(`INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES (${q(t.brand)}, ${q(t.model)}, ${q(t.storage)}, ${n(t.baseValue)})
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;`);
}
out.push("");

// ---- blog
out.push(`-- Notas del blog`);
for (const p of POSTS) {
  out.push(`INSERT INTO posts (title, slug, excerpt, body, cover_url, author, is_published, published_at)
  VALUES (${q(p.title)}, ${q(p.slug)}, ${q(p.excerpt)}, ${q(p.body)}, ${q(p.coverUrl)}, ${q(p.author)}, TRUE, ${q(p.publishedAt)})
  ON CONFLICT (slug) DO NOTHING;`);
}

out.push(`\nCOMMIT;`);

process.stdout.write(out.join("\n") + "\n");
