-- iPhone Purple — datos de ejemplo
-- Generado desde lib/data/seed.ts. Aplicar DESPUÉS de schema.sql.
-- Es idempotente: se puede correr varias veces sin duplicar nada.

BEGIN;

-- Ajustes de la tienda
INSERT INTO store_settings (key, value) VALUES ('dollarRate', '1450'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('defaultMarginPct', '18'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('whatsappNumber', '"5491100000000"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('whatsappDisplay', '"+54 9 11 0000-0000"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('instagram', '"https://instagram.com/iphonepurple"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('tiktok', '"https://tiktok.com/@iphonepurple"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('email', '"hola@iphonepurple.com.ar"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('address', '"Calle 7 1234, La Plata"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('hours', '"Lunes a sábado de 10 a 19 h"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('mapsUrl', '"https://maps.google.com/?q=Calle+7+1234,+La+Plata"'::jsonb)
  ON CONFLICT (key) DO NOTHING;

-- Proveedores
INSERT INTO suppliers (name, phone, default_margin_pct, is_active)
  SELECT 'Distribuidora Centro', '+54 9 11 5555-1111', 18, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Distribuidora Centro');
INSERT INTO suppliers (name, phone, default_margin_pct, is_active)
  SELECT 'Mayorista Once', '+54 9 11 5555-2222', 15, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Mayorista Once');
INSERT INTO suppliers (name, phone, default_margin_pct, is_active)
  SELECT 'Importaciones Sur', '+54 9 11 5555-3333', 22, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Importaciones Sur');

-- Catálogo
INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 17', 'iphone-17', 'Apple', 'iPhone 17', 'celular', 'iPhone 17 revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.3\" Super Retina XDR","Chip":"A18","Cámara":"48 MP dual","Material":"Aluminio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-17/1.png', 'iPhone 17 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-17'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-17' AND pi.url = '/productos/iphone-17/1.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Naranja Cósmico', '#d97a45', 'sellado', 'original', NULL, 1523000, 1050, 882, 3, 'IPHONE-17-128GB-1'
  FROM products WHERE slug = 'iphone-17'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Blanco Nube', '#f0efeb', 'a-plus', 'original', 97, 1480000, 1021, 858, 1, 'IPHONE-17-256GB-2'
  FROM products WHERE slug = 'iphone-17'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Naranja Cósmico', '#d97a45', 'a', 'original', 91, 1218000, 840, 706, 2, 'IPHONE-17-128GB-3'
  FROM products WHERE slug = 'iphone-17'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-128GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 17 Pro', 'iphone-17-pro', 'Apple', 'iPhone 17 Pro', 'celular', 'iPhone 17 Pro revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.3\" Super Retina XDR","Chip":"A18 Pro","Cámara":"48 MP + teleobjetivo","Material":"Titanio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-17-pro/1.jpg', 'iPhone 17 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-17-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-17-pro' AND pi.url = '/productos/iphone-17-pro/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-17-pro/2.png', 'iPhone 17 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-17-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-17-pro' AND pi.url = '/productos/iphone-17-pro/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Naranja Cósmico', '#d97a45', 'sellado', 'original', NULL, 1958000, 1350, 1134, 3, 'IPHONE-17-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-17-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Blanco Nube', '#f0efeb', 'a-plus', 'original', 97, 1863000, 1285, 1079, 1, 'IPHONE-17-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-17-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-PRO-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Naranja Cósmico', '#d97a45', 'a', 'original', 91, 1914000, 1320, 1109, 2, 'IPHONE-17-PRO-512GB-3'
  FROM products WHERE slug = 'iphone-17-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-PRO-512GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 17 Pro Max', 'iphone-17-pro-max', 'Apple', 'iPhone 17 Pro Max', 'celular', 'iPhone 17 Pro Max revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.9\" Super Retina XDR","Chip":"A18 Pro","Cámara":"48 MP + teleobjetivo","Material":"Titanio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-17-pro-max/1.png', 'iPhone 17 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-17-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-17-pro-max' AND pi.url = '/productos/iphone-17-pro-max/1.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Naranja Cósmico', '#d97a45', 'sellado', 'original', NULL, 2407000, 1660, 1394, 3, 'IPHONE-17-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-17-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Blanco Nube', '#f0efeb', 'a-plus', 'original', 97, 2361000, 1628, 1368, 1, 'IPHONE-17-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-17-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-PRO-MAX-512GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '1TB', 'Naranja Cósmico', '#d97a45', 'a', 'original', 91, 2401000, 1656, 1391, 2, 'IPHONE-17-PRO-MAX-1TB-3'
  FROM products WHERE slug = 'iphone-17-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-17-PRO-MAX-1TB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 16', 'iphone-16', 'Apple', 'iPhone 16', 'celular', 'iPhone 16 revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A17","Cámara":"48 MP dual","Material":"Aluminio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-16/1.png', 'iPhone 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16' AND pi.url = '/productos/iphone-16/1.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Negro', '#3b3b3d', 'sellado', 'original', NULL, 1378000, 950, 798, 2, 'IPHONE-16-128GB-1'
  FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Natural', '#c2bcb2', 'a-plus', 'original', 97, 1353000, 933, 784, 3, 'IPHONE-16-256GB-2'
  FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Negro', '#3b3b3d', 'a', 'original', 91, 1102000, 760, 638, 1, 'IPHONE-16-128GB-3'
  FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-128GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 16 Pro', 'iphone-16-pro', 'Apple', 'iPhone 16 Pro', 'celular', 'iPhone 16 Pro revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.3\" Super Retina XDR","Chip":"A17 Pro","Cámara":"48 MP + teleobjetivo","Material":"Titanio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-16-pro/1.jpg', 'iPhone 16 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro' AND pi.url = '/productos/iphone-16-pro/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-16-pro/2.png', 'iPhone 16 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro' AND pi.url = '/productos/iphone-16-pro/2.png');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-16-pro/3.jpg', 'iPhone 16 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro' AND pi.url = '/productos/iphone-16-pro/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Negro', '#3b3b3d', 'sellado', 'original', NULL, 1813000, 1250, 1050, 2, 'IPHONE-16-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Natural', '#c2bcb2', 'a-plus', 'original', 97, 1736000, 1197, 1005, 3, 'IPHONE-16-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Titanio Negro', '#3b3b3d', 'a', 'original', 91, 1798000, 1240, 1042, 1, 'IPHONE-16-PRO-512GB-3'
  FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-512GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 16 Pro Max', 'iphone-16-pro-max', 'Apple', 'iPhone 16 Pro Max', 'celular', 'iPhone 16 Pro Max revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.9\" Super Retina XDR","Chip":"A17 Pro","Cámara":"48 MP + teleobjetivo","Material":"Titanio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-16-pro-max/1.jpg', 'iPhone 16 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro-max' AND pi.url = '/productos/iphone-16-pro-max/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-16-pro-max/2.png', 'iPhone 16 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro-max' AND pi.url = '/productos/iphone-16-pro-max/2.png');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-16-pro-max/3.jpg', 'iPhone 16 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro-max' AND pi.url = '/productos/iphone-16-pro-max/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Negro', '#3b3b3d', 'sellado', 'original', NULL, 2262000, 1560, 1310, 2, 'IPHONE-16-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Titanio Natural', '#c2bcb2', 'a-plus', 'original', 97, 2233000, 1540, 1294, 3, 'IPHONE-16-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-MAX-512GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '1TB', 'Titanio Negro', '#3b3b3d', 'a', 'original', 91, 2285000, 1576, 1324, 1, 'IPHONE-16-PRO-MAX-1TB-3'
  FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-MAX-1TB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 15', 'iphone-15', 'Apple', 'iPhone 15', 'celular', 'iPhone 15 revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A16","Cámara":"48 MP dual","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-15/1.jpg', 'iPhone 15 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15' AND pi.url = '/productos/iphone-15/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-15/2.png', 'iPhone 15 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15' AND pi.url = '/productos/iphone-15/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Azul', '#5f6b7a', 'a-plus', 'original', 97, 1021000, 704, 591, 1, 'IPHONE-15-128GB-1'
  FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Natural', '#c2bcb2', 'a', 'original', 91, 1056000, 728, 612, 2, 'IPHONE-15-256GB-2'
  FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Azul', '#5f6b7a', 'a-minus', 'original', 84, 812000, 560, 470, 3, 'IPHONE-15-128GB-3'
  FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-128GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 15 Pro', 'iphone-15-pro', 'Apple', 'iPhone 15 Pro', 'celular', 'iPhone 15 Pro revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A16 Pro","Cámara":"48 MP + teleobjetivo","Material":"Titanio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-15-pro/1.jpg', 'iPhone 15 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15-pro' AND pi.url = '/productos/iphone-15-pro/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-15-pro/2.png', 'iPhone 15 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15-pro' AND pi.url = '/productos/iphone-15-pro/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Azul', '#5f6b7a', 'a-plus', 'original', 97, 1340000, 924, 776, 1, 'IPHONE-15-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Natural', '#c2bcb2', 'a', 'original', 91, 1346000, 928, 780, 2, 'IPHONE-15-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Titanio Azul', '#5f6b7a', 'a-minus', 'original', 84, 1370000, 945, 794, 3, 'IPHONE-15-PRO-512GB-3'
  FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-512GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 15 Pro Max', 'iphone-15-pro-max', 'Apple', 'iPhone 15 Pro Max', 'celular', 'iPhone 15 Pro Max revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.7\" Super Retina XDR","Chip":"A16 Pro","Cámara":"48 MP + teleobjetivo","Material":"Titanio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-15-pro-max/1.jpg', 'iPhone 15 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15-pro-max' AND pi.url = '/productos/iphone-15-pro-max/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-15-pro-max/2.png', 'iPhone 15 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15-pro-max' AND pi.url = '/productos/iphone-15-pro-max/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Azul', '#5f6b7a', 'a-plus', 'original', 97, 1736000, 1197, 1005, 1, 'IPHONE-15-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Titanio Natural', '#c2bcb2', 'a', 'original', 91, 1798000, 1240, 1042, 2, 'IPHONE-15-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-MAX-512GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '1TB', 'Titanio Azul', '#5f6b7a', 'a-minus', 'original', 84, 1797000, 1239, 1041, 3, 'IPHONE-15-PRO-MAX-1TB-3'
  FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-MAX-1TB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 14', 'iphone-14', 'Apple', 'iPhone 14', 'celular', 'iPhone 14 revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A15","Cámara":"48 MP dual","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-14/1.jpg', 'iPhone 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14' AND pi.url = '/productos/iphone-14/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-14/2.png', 'iPhone 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14' AND pi.url = '/productos/iphone-14/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Morado Oscuro', '#5b5069', 'a-plus', 'original', 97, 829000, 572, 480, 0, 'IPHONE-14-128GB-1'
  FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Medianoche', '#2c2c34', 'a', 'original', 91, 882000, 608, 511, 1, 'IPHONE-14-256GB-2'
  FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Morado Oscuro', '#5b5069', 'a-minus', 'original', 84, 660000, 455, 382, 2, 'IPHONE-14-128GB-3'
  FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-128GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 14 Pro', 'iphone-14-pro', 'Apple', 'iPhone 14 Pro', 'celular', 'iPhone 14 Pro revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A15 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-14-pro/1.jpg', 'iPhone 14 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14-pro' AND pi.url = '/productos/iphone-14-pro/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-14-pro/2.png', 'iPhone 14 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14-pro' AND pi.url = '/productos/iphone-14-pro/2.png');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-14-pro/3.jpg', 'iPhone 14 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14-pro' AND pi.url = '/productos/iphone-14-pro/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Morado Oscuro', '#5b5069', 'a-plus', 'original', 97, 1085000, 748, 628, 0, 'IPHONE-14-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Medianoche', '#2c2c34', 'a', 'original', 91, 1114000, 768, 645, 1, 'IPHONE-14-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Morado Oscuro', '#5b5069', 'a-minus', 'original', 84, 1167000, 805, 676, 2, 'IPHONE-14-PRO-512GB-3'
  FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-512GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 14 Pro Max', 'iphone-14-pro-max', 'Apple', 'iPhone 14 Pro Max', 'celular', 'iPhone 14 Pro Max revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.7\" Super Retina XDR","Chip":"A15 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-14-pro-max/1.jpg', 'iPhone 14 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-14-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14-pro-max' AND pi.url = '/productos/iphone-14-pro-max/1.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Morado Oscuro', '#5b5069', 'a-plus', 'original', 97, 1417000, 977, 821, 0, 'IPHONE-14-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-14-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Medianoche', '#2c2c34', 'a', 'original', 91, 1508000, 1040, 874, 1, 'IPHONE-14-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-14-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-MAX-512GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '1TB', 'Morado Oscuro', '#5b5069', 'a-minus', 'original', 84, 1543000, 1064, 894, 2, 'IPHONE-14-PRO-MAX-1TB-3'
  FROM products WHERE slug = 'iphone-14-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-MAX-1TB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 13', 'iphone-13', 'Apple', 'iPhone 13', 'celular', 'iPhone 13 revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A14","Cámara":"48 MP dual","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-13/1.png', 'iPhone 13 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-13'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-13' AND pi.url = '/productos/iphone-13/1.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Medianoche', '#2c2c34', 'a', 'original', 91, 603000, 416, 349, 2, 'IPHONE-13-128GB-1'
  FROM products WHERE slug = 'iphone-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Azul Sierra', '#87a6c4', 'a-minus', 'original', 84, 639000, 441, 370, 0, 'IPHONE-13-256GB-2'
  FROM products WHERE slug = 'iphone-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 13 Pro', 'iphone-13-pro', 'Apple', 'iPhone 13 Pro', 'celular', 'iPhone 13 Pro revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A14 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-13-pro/1.jpg', 'iPhone 13 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-13-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-13-pro' AND pi.url = '/productos/iphone-13-pro/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-13-pro/2.png', 'iPhone 13 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-13-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-13-pro' AND pi.url = '/productos/iphone-13-pro/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Medianoche', '#2c2c34', 'a', 'original', 91, 812000, 560, 470, 2, 'IPHONE-13-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-13-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Azul Sierra', '#87a6c4', 'a-minus', 'original', 84, 822000, 567, 476, 0, 'IPHONE-13-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-13-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-PRO-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 13 Pro Max', 'iphone-13-pro-max', 'Apple', 'iPhone 13 Pro Max', 'celular', 'iPhone 13 Pro Max revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.7\" Super Retina XDR","Chip":"A14 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Medianoche', '#2c2c34', 'a', 'original', 91, 1079000, 744, 625, 2, 'IPHONE-13-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-13-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Azul Sierra', '#87a6c4', 'a-minus', 'original', 84, 1137000, 784, 659, 0, 'IPHONE-13-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-13-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-PRO-MAX-512GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 12', 'iphone-12', 'Apple', 'iPhone 12', 'celular', 'iPhone 12 revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A13","Cámara":"48 MP dual","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-12/1.png', 'iPhone 12 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-12'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-12' AND pi.url = '/productos/iphone-12/1.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Negro', '#2c2c2e', 'a', 'original', 91, 464000, 320, 269, 1, 'IPHONE-12-128GB-1'
  FROM products WHERE slug = 'iphone-12'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Verde', '#c9ddc4', 'a-minus', 'original', 84, 518000, 357, 300, 2, 'IPHONE-12-256GB-2'
  FROM products WHERE slug = 'iphone-12'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 12 Pro', 'iphone-12-pro', 'Apple', 'iPhone 12 Pro', 'celular', 'iPhone 12 Pro revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A13 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-12-pro/1.jpg', 'iPhone 12 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-12-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-12-pro' AND pi.url = '/productos/iphone-12-pro/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-12-pro/2.png', 'iPhone 12 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-12-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-12-pro' AND pi.url = '/productos/iphone-12-pro/2.png');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-12-pro/3.jpg', 'iPhone 12 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-12-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-12-pro' AND pi.url = '/productos/iphone-12-pro/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Negro', '#2c2c2e', 'a', 'original', 91, 638000, 440, 370, 1, 'IPHONE-12-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-12-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Verde', '#c9ddc4', 'a-minus', 'original', 84, 670000, 462, 388, 2, 'IPHONE-12-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-12-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-PRO-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 12 Pro Max', 'iphone-12-pro-max', 'Apple', 'iPhone 12 Pro Max', 'celular', 'iPhone 12 Pro Max revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.7\" Super Retina XDR","Chip":"A13 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Negro', '#2c2c2e', 'a', 'original', 91, 882000, 608, 511, 1, 'IPHONE-12-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-12-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Verde', '#c9ddc4', 'a-minus', 'original', 84, 964000, 665, 559, 2, 'IPHONE-12-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-12-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-PRO-MAX-512GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 11', 'iphone-11', 'Apple', 'iPhone 11', 'celular', 'iPhone 11 revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A12","Cámara":"48 MP dual","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-11/1.jpg', 'iPhone 11 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-11'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-11' AND pi.url = '/productos/iphone-11/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-11/2.png', 'iPhone 11 Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-11'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-11' AND pi.url = '/productos/iphone-11/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Blanco', '#f2f2f0', 'a', 'original', 91, 348000, 240, 202, 3, 'IPHONE-11-128GB-1'
  FROM products WHERE slug = 'iphone-11'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Negro', '#2c2c2e', 'a-minus', 'original', 84, 416000, 287, 241, 1, 'IPHONE-11-256GB-2'
  FROM products WHERE slug = 'iphone-11'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 11 Pro', 'iphone-11-pro', 'Apple', 'iPhone 11 Pro', 'celular', 'iPhone 11 Pro revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"5.8\" Super Retina XDR","Chip":"A12 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-11-pro/1.png', 'iPhone 11 Pro Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-11-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-11-pro' AND pi.url = '/productos/iphone-11-pro/1.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Blanco', '#f2f2f0', 'a', 'original', 91, 487000, 336, 282, 3, 'IPHONE-11-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-11-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Negro', '#2c2c2e', 'a-minus', 'original', 84, 538000, 371, 312, 1, 'IPHONE-11-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-11-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-PRO-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 11 Pro Max', 'iphone-11-pro-max', 'Apple', 'iPhone 11 Pro Max', 'celular', 'iPhone 11 Pro Max revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.', '{"Pantalla":"6.5\" Super Retina XDR","Chip":"A12 Pro","Cámara":"48 MP + teleobjetivo","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-11-pro-max/1.jpg', 'iPhone 11 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-11-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-11-pro-max' AND pi.url = '/productos/iphone-11-pro-max/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/iphone-11-pro-max/2.png', 'iPhone 11 Pro Max Apple en venta en La Plata', 0 FROM products WHERE slug = 'iphone-11-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-11-pro-max' AND pi.url = '/productos/iphone-11-pro-max/2.png');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Blanco', '#f2f2f0', 'a', 'original', 91, 708000, 488, 410, 3, 'IPHONE-11-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-11-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Negro', '#2c2c2e', 'a-minus', 'original', 84, 812000, 560, 470, 1, 'IPHONE-11-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-11-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-PRO-MAX-512GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Acer Aspire Go 15 AG15-42P', 'acer-aspire-go-15-ag15-42p', 'Acer', 'Acer Aspire Go 15 AG15-42P', 'notebook', 'Acer Aspire Go 15 AG15-42P nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Procesador":"AMD Ryzen 7 7730U","Memoria":"16 GB DDR4","Almacenamiento":"512 GB SSD","Pantalla":"15.6\" Full HD","Sistema operativo":"Windows 11"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 512GB', 'Pure Silver', '#c9ccd1', 'sellado', 'original', NULL, 1334000, 920, 780, 2, 'ACER-ASPIRE-GO-15-AG15-42P-16GB · 512GB-1'
  FROM products WHERE slug = 'acer-aspire-go-15-ag15-42p'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'ACER-ASPIRE-GO-15-AG15-42P-16GB · 512GB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Acer Swift Go SFG16-72', 'acer-swift-go-sfg16-72', 'Acer', 'Acer Swift Go SFG16-72', 'notebook', 'Acer Swift Go SFG16-72 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Procesador":"Intel Core Ultra 5 125H","Memoria":"8 GB DDR5","Almacenamiento":"512 GB SSD","Pantalla":"16\" 3.2K OLED, 120 Hz","Sistema operativo":"Windows 11 Home"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '8GB · 512GB', 'Steel Gray', '#6b6f76', 'sellado', 'original', NULL, 1363000, 940, 800, 2, 'ACER-SWIFT-GO-SFG16-72-8GB · 512GB-1'
  FROM products WHERE slug = 'acer-swift-go-sfg16-72'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'ACER-SWIFT-GO-SFG16-72-8GB · 512GB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Asus Vivobook Go E1504FA', 'asus-vivobook-go-e1504fa', 'Asus', 'Asus Vivobook Go E1504FA', 'notebook', 'Asus Vivobook Go E1504FA nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Procesador":"AMD Ryzen 5","Memoria":"8 GB","Almacenamiento":"512 GB SSD","Pantalla":"15.6\" Full HD","Sistema operativo":"Windows 11"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '8GB · 512GB', 'Mixed Black', '#2c2c2e', 'sellado', 'original', NULL, 986000, 680, 575, 2, 'ASUS-VIVOBOOK-GO-E1504FA-8GB · 512GB-1'
  FROM products WHERE slug = 'asus-vivobook-go-e1504fa'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'ASUS-VIVOBOOK-GO-E1504FA-8GB · 512GB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Asus X1404VA', 'asus-x1404va', 'Asus', 'Asus X1404VA', 'notebook', 'Asus X1404VA nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Procesador":"Intel Core i7-1355U","Memoria":"12 GB","Almacenamiento":"512 GB SSD","Pantalla":"14\" Full HD","Sistema operativo":"Windows 11"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '12GB · 512GB', 'Azul', '#3f5878', 'sellado', 'original', NULL, 1305000, 900, 765, 2, 'ASUS-X1404VA-12GB · 512GB-1'
  FROM products WHERE slug = 'asus-x1404va'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'ASUS-X1404VA-12GB · 512GB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Asus Vivobook X1407QA', 'asus-vivobook-x1407qa', 'Asus', 'Asus Vivobook X1407QA', 'notebook', 'Asus Vivobook X1407QA nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Procesador":"Snapdragon X8 X1-26-100","Memoria":"16 GB LPDDR5X","Almacenamiento":"512 GB SSD","Pantalla":"14\" 1920 × 1200","Sistema operativo":"Windows 11"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 512GB', 'Cool Silver', '#c9ccd1', 'sellado', 'original', NULL, 1276000, 880, 745, 2, 'ASUS-VIVOBOOK-X1407QA-16GB · 512GB-1'
  FROM products WHERE slug = 'asus-vivobook-x1407qa'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'ASUS-VIVOBOOK-X1407QA-16GB · 512GB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Asus Vivobook Go F1504VAP', 'asus-vivobook-go-f1504vap', 'Asus', 'Asus Vivobook Go F1504VAP', 'notebook', 'Asus Vivobook Go F1504VAP nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Procesador":"Intel Core 7 150U","Memoria":"16 GB","Almacenamiento":"1 TB SSD","Pantalla":"15.6\" Full HD táctil","Sistema operativo":"Windows 11 Home"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 1TB', 'Cool Silver', '#c9ccd1', 'sellado', 'original', NULL, 1755000, 1210, 1025, 2, 'ASUS-VIVOBOOK-GO-F1504VAP-16GB · 1TB-1'
  FROM products WHERE slug = 'asus-vivobook-go-f1504vap'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'ASUS-VIVOBOOK-GO-F1504VAP-16GB · 1TB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Nintendo Switch OLED', 'nintendo-switch-oled', 'Nintendo', 'Nintendo Switch OLED', 'consola', 'Nintendo Switch OLED nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Pantalla":"7\" OLED","Almacenamiento":"64 GB","Incluye":"Dock y Joy-Con"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/nintendo-switch-oled/1.jpg', 'Nintendo Switch OLED Nintendo en venta en La Plata', 0 FROM products WHERE slug = 'nintendo-switch-oled'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'nintendo-switch-oled' AND pi.url = '/productos/nintendo-switch-oled/1.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '64GB', 'Neón', '#e60012', 'sellado', 'original', NULL, 711000, 490, 419, 2, 'NINTENDO-SWITCH-OLED-64GB-1'
  FROM products WHERE slug = 'nintendo-switch-oled'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'NINTENDO-SWITCH-OLED-64GB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Nintendo Switch 2 + Mario Kart', 'nintendo-switch-2-mario-kart', 'Nintendo', 'Nintendo Switch 2 + Mario Kart', 'consola', 'Nintendo Switch 2 + Mario Kart nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Incluye":"Consola + Mario Kart","Región":"US"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/nintendo-switch-2-mario-kart/1.jpg', 'Nintendo Switch 2 + Mario Kart Nintendo en venta en La Plata', 0 FROM products WHERE slug = 'nintendo-switch-2-mario-kart'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'nintendo-switch-2-mario-kart' AND pi.url = '/productos/nintendo-switch-2-mario-kart/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/nintendo-switch-2-mario-kart/2.jpg', 'Nintendo Switch 2 + Mario Kart Nintendo en venta en La Plata', 0 FROM products WHERE slug = 'nintendo-switch-2-mario-kart'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'nintendo-switch-2-mario-kart' AND pi.url = '/productos/nintendo-switch-2-mario-kart/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/nintendo-switch-2-mario-kart/3.jpg', 'Nintendo Switch 2 + Mario Kart Nintendo en venta en La Plata', 0 FROM products WHERE slug = 'nintendo-switch-2-mario-kart'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'nintendo-switch-2-mario-kart' AND pi.url = '/productos/nintendo-switch-2-mario-kart/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Bundle US', 'Negro', '#2c2c2e', 'sellado', 'original', NULL, 1073000, 740, 630, 2, 'NINTENDO-SWITCH-2-MARIO-KART-Bundle US-1'
  FROM products WHERE slug = 'nintendo-switch-2-mario-kart'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'NINTENDO-SWITCH-2-MARIO-KART-Bundle US-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Logitech G29 Driving Force', 'logitech-g29-driving-force', 'Logitech', 'Logitech G29 Driving Force', 'accesorio', 'Logitech G29 Driving Force nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Compatibilidad":"PS5, PS4 y PC","Incluye":"Volante y pedales"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/logitech-g29-driving-force/1.jpg', 'Logitech G29 Driving Force Logitech en venta en La Plata', 0 FROM products WHERE slug = 'logitech-g29-driving-force'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'logitech-g29-driving-force' AND pi.url = '/productos/logitech-g29-driving-force/1.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Volante + pedales', 'Negro', '#2c2c2e', 'sellado', 'original', NULL, 595000, 410, 350, 2, 'LOGITECH-G29-DRIVING-FORCE-Volante + pedales-1'
  FROM products WHERE slug = 'logitech-g29-driving-force'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'LOGITECH-G29-DRIVING-FORCE-Volante + pedales-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('WD_Black NVMe SSD para PS5', 'wdblack-nvme-ssd-para-ps5', 'Western Digital', 'WD_Black NVMe SSD para PS5', 'accesorio', 'WD_Black NVMe SSD para PS5 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Capacidad":"2 TB","Interfaz":"NVMe","Uso":"Expansión de PS5"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '2TB', 'Negro', '#2c2c2e', 'sellado', 'original', NULL, 638000, 440, 370, 2, 'WDBLACK-NVME-SSD-PARA-PS5-2TB-1'
  FROM products WHERE slug = 'wdblack-nvme-ssd-para-ps5'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'WDBLACK-NVME-SSD-PARA-PS5-2TB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Redmi 15C', 'redmi-15c', 'Xiaomi', 'Redmi 15C', 'celular', 'Redmi 15C nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"8 GB + 256 GB","Red":"4G"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/redmi-15c/1.jpg', 'Redmi 15C Xiaomi en venta en La Plata', 0 FROM products WHERE slug = 'redmi-15c'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'redmi-15c' AND pi.url = '/productos/redmi-15c/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/redmi-15c/2.jpg', 'Redmi 15C Xiaomi en venta en La Plata', 0 FROM products WHERE slug = 'redmi-15c'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'redmi-15c' AND pi.url = '/productos/redmi-15c/2.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '8+256', 'Negro', '#2c2c2e', 'sellado', 'original', NULL, 305000, 210, 180, 2, 'REDMI-15C-8+256-1'
  FROM products WHERE slug = 'redmi-15c'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'REDMI-15C-8+256-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '8+256', 'Verde', '#7fa886', 'sellado', 'original', NULL, 305000, 210, 180, 2, 'REDMI-15C-8+256-2'
  FROM products WHERE slug = 'redmi-15c'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'REDMI-15C-8+256-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Redmi Pad 2', 'redmi-pad-2', 'Xiaomi', 'Redmi Pad 2', 'tablet', 'Redmi Pad 2 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Pantalla":"11\"","Memoria":"4 GB + 128 GB"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '11" 4+128', 'Gris', '#8a8a90', 'sellado', 'original', NULL, 363000, 250, 210, 2, 'REDMI-PAD-2-11" 4+128-1'
  FROM products WHERE slug = 'redmi-pad-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'REDMI-PAD-2-11" 4+128-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '11" 4+128', 'Verde', '#7fa886', 'sellado', 'original', NULL, 363000, 250, 210, 2, 'REDMI-PAD-2-11" 4+128-2'
  FROM products WHERE slug = 'redmi-pad-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'REDMI-PAD-2-11" 4+128-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Poco F8 Ultra', 'poco-f8-ultra', 'Xiaomi', 'Poco F8 Ultra', 'celular', 'Poco F8 Ultra nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"12 GB + 256 GB","Red":"5G"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '12+256 5G', 'Azul', '#3f6fb5', 'sellado', 'original', NULL, 1233000, 850, 720, 2, 'POCO-F8-ULTRA-12+256 5G-1'
  FROM products WHERE slug = 'poco-f8-ultra'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'POCO-F8-ULTRA-12+256 5G-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Xiaomi 17', 'xiaomi-17', 'Xiaomi', 'Xiaomi 17', 'celular', 'Xiaomi 17 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"12 GB + 512 GB","Red":"5G"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '12+512 5G', 'Negro', '#2c2c2e', 'sellado', 'original', NULL, 1508000, 1040, 880, 2, 'XIAOMI-17-12+512 5G-1'
  FROM products WHERE slug = 'xiaomi-17'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'XIAOMI-17-12+512 5G-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Xiaomi 17 Ultra', 'xiaomi-17-ultra', 'Xiaomi', 'Xiaomi 17 Ultra', 'celular', 'Xiaomi 17 Ultra nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"12 GB + 512 GB","Red":"5G"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '12+512 5G', 'Blanco', '#f0efeb', 'sellado', 'original', NULL, 2146000, 1480, 1250, 2, 'XIAOMI-17-ULTRA-12+512 5G-1'
  FROM products WHERE slug = 'xiaomi-17-ultra'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'XIAOMI-17-ULTRA-12+512 5G-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '12+512 5G', 'Verde', '#7fa886', 'sellado', 'original', NULL, 2146000, 1480, 1250, 2, 'XIAOMI-17-ULTRA-12+512 5G-2'
  FROM products WHERE slug = 'xiaomi-17-ultra'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'XIAOMI-17-ULTRA-12+512 5G-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Moto G06', 'moto-g06', 'Motorola', 'Moto G06', 'celular', 'Moto G06 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"4 GB + 128 GB","SIM":"Dual"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '4+128 DS', 'Azul', '#3f6fb5', 'sellado', 'original', NULL, 247000, 170, 145, 2, 'MOTO-G06-4+128 DS-1'
  FROM products WHERE slug = 'moto-g06'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MOTO-G06-4+128 DS-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Moto G15', 'moto-g15', 'Motorola', 'Moto G15', 'celular', 'Moto G15 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"4 GB + 512 GB","SIM":"Dual"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '4+512 DS', 'Azul', '#3f6fb5', 'sellado', 'original', NULL, 305000, 210, 175, 2, 'MOTO-G15-4+512 DS-1'
  FROM products WHERE slug = 'moto-g15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MOTO-G15-4+512 DS-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Moto G17', 'moto-g17', 'Motorola', 'Moto G17', 'celular', 'Moto G17 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"4 GB + 256 GB","SIM":"Dual"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '4+256 DS', 'Arándano', '#6b3a5b', 'sellado', 'original', NULL, 348000, 240, 200, 2, 'MOTO-G17-4+256 DS-1'
  FROM products WHERE slug = 'moto-g17'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MOTO-G17-4+256 DS-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '4+256 DS', 'Celeste', '#8fc0d8', 'sellado', 'original', NULL, 348000, 240, 200, 2, 'MOTO-G17-4+256 DS-2'
  FROM products WHERE slug = 'moto-g17'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MOTO-G17-4+256 DS-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Moto G35', 'moto-g35', 'Motorola', 'Moto G35', 'celular', 'Moto G35 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"4 GB + 256 GB","SIM":"Dual"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '4+256 DS', 'Negro', '#2c2c2e', 'sellado', 'original', NULL, 305000, 210, 175, 2, 'MOTO-G35-4+256 DS-1'
  FROM products WHERE slug = 'moto-g35'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MOTO-G35-4+256 DS-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Moto G67', 'moto-g67', 'Motorola', 'Moto G67', 'celular', 'Moto G67 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Memoria":"4 GB + 256 GB","SIM":"Dual"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '4+256 DS', 'Gris', '#8a8a90', 'sellado', 'original', NULL, 450000, 310, 265, 2, 'MOTO-G67-4+256 DS-1'
  FROM products WHERE slug = 'moto-g67'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MOTO-G67-4+256 DS-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Dyson HD18 Hair Dryer R Professional', 'dyson-hd18-hair-dryer-r-professional', 'Dyson', 'Dyson HD18 Hair Dryer R Professional', 'hogar', 'Dyson HD18 Hair Dryer R Professional nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Tensión":"220V","Incluye":"Accesorios","Estuche":"No incluye"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Sin estuche', 'Vinca Blue', '#5f7fb5', 'sellado', 'original', NULL, 943000, 650, 549, 2, 'DYSON-HD18-HAIR-DRYER-R-PROFESSIONAL-Sin estuche-1'
  FROM products WHERE slug = 'dyson-hd18-hair-dryer-r-professional'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'DYSON-HD18-HAIR-DRYER-R-PROFESSIONAL-Sin estuche-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Sin estuche', 'Topaz', '#c89a5b', 'sellado', 'original', NULL, 943000, 650, 549, 2, 'DYSON-HD18-HAIR-DRYER-R-PROFESSIONAL-Sin estuche-2'
  FROM products WHERE slug = 'dyson-hd18-hair-dryer-r-professional'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'DYSON-HD18-HAIR-DRYER-R-PROFESSIONAL-Sin estuche-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Dyson HD16 Hair Dryer Nural', 'dyson-hd16-hair-dryer-nural', 'Dyson', 'Dyson HD16 Hair Dryer Nural', 'hogar', 'Dyson HD16 Hair Dryer Nural nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Tensión":"220V","Estuche":"No incluye"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Sin estuche', 'Vinca Blue', '#5f7fb5', 'sellado', 'original', NULL, 769000, 530, 449, 2, 'DYSON-HD16-HAIR-DRYER-NURAL-Sin estuche-1'
  FROM products WHERE slug = 'dyson-hd16-hair-dryer-nural'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'DYSON-HD16-HAIR-DRYER-NURAL-Sin estuche-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Sin estuche', 'Ceramic', '#dcd3c6', 'sellado', 'original', NULL, 769000, 530, 449, 2, 'DYSON-HD16-HAIR-DRYER-NURAL-Sin estuche-2'
  FROM products WHERE slug = 'dyson-hd16-hair-dryer-nural'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'DYSON-HD16-HAIR-DRYER-NURAL-Sin estuche-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Dyson HS08 I.d Straight+Wavy', 'dyson-hs08-id-straightwavy', 'Dyson', 'Dyson HS08 I.d Straight+Wavy', 'hogar', 'Dyson HS08 I.d Straight+Wavy nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Tensión":"220V","Tipo":"Moldeador multifunción"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Moldeador', 'Jasper Plum', '#6b4a6b', 'sellado', 'original', NULL, 1189000, 820, 699, 2, 'DYSON-HS08-ID-STRAIGHTWAVY-Moldeador-1'
  FROM products WHERE slug = 'dyson-hs08-id-straightwavy'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'DYSON-HS08-ID-STRAIGHTWAVY-Moldeador-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Xiaomi Aspiradora Mijia 2', 'xiaomi-aspiradora-mijia-2', 'Xiaomi', 'Xiaomi Aspiradora Mijia 2', 'hogar', 'Xiaomi Aspiradora Mijia 2 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Tipo":"Inalámbrica","Tensión":"220V"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Inalámbrica', 'Blanco', '#f0efeb', 'sellado', 'original', NULL, 479000, 330, 279, 2, 'XIAOMI-ASPIRADORA-MIJIA-2-Inalámbrica-1'
  FROM products WHERE slug = 'xiaomi-aspiradora-mijia-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'XIAOMI-ASPIRADORA-MIJIA-2-Inalámbrica-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Xiaomi Band 9 Active', 'xiaomi-band-9-active', 'Xiaomi', 'Xiaomi Band 9 Active', 'reloj', 'Xiaomi Band 9 Active nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Tipo":"Banda de actividad"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Estándar', 'Rosa', '#e8a7bd', 'sellado', 'original', NULL, 44000, 30, 28, 12, 'XIAOMI-BAND-9-ACTIVE-Estándar-1'
  FROM products WHERE slug = 'xiaomi-band-9-active'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'XIAOMI-BAND-9-ACTIVE-Estándar-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Estándar', 'Blanco', '#f0efeb', 'sellado', 'original', NULL, 44000, 30, 28, 12, 'XIAOMI-BAND-9-ACTIVE-Estándar-2'
  FROM products WHERE slug = 'xiaomi-band-9-active'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'XIAOMI-BAND-9-ACTIVE-Estándar-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Garmin Instinct 2S Solar', 'garmin-instinct-2s-solar', 'Garmin', 'Garmin Instinct 2S Solar', 'reloj', 'Garmin Instinct 2S Solar nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Carga":"Solar","Uso":"Outdoor"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/garmin-instinct-2s-solar/1.jpg', 'Garmin Instinct 2S Solar Garmin en venta en La Plata', 0 FROM products WHERE slug = 'garmin-instinct-2s-solar'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'garmin-instinct-2s-solar' AND pi.url = '/productos/garmin-instinct-2s-solar/1.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Rugged', 'Grafito', '#4a4a52', 'sellado', 'original', NULL, 450000, 310, 259, 2, 'GARMIN-INSTINCT-2S-SOLAR-Rugged-1'
  FROM products WHERE slug = 'garmin-instinct-2s-solar'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'GARMIN-INSTINCT-2S-SOLAR-Rugged-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Garmin Epix Pro Gen 2', 'garmin-epix-pro-gen-2', 'Garmin', 'Garmin Epix Pro Gen 2', 'reloj', 'Garmin Epix Pro Gen 2 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Caja":"51 mm","Cristal":"Zafiro","Uso":"Multideporte"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '51mm Sapphire', 'Gris', '#8a8a90', 'sellado', 'original', NULL, 1117000, 770, 649, 2, 'GARMIN-EPIX-PRO-GEN-2-51mm Sapphire-1'
  FROM products WHERE slug = 'garmin-epix-pro-gen-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'GARMIN-EPIX-PRO-GEN-2-51mm Sapphire-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '51mm Sapphire', 'Blanco', '#f0efeb', 'sellado', 'original', NULL, 1117000, 770, 649, 2, 'GARMIN-EPIX-PRO-GEN-2-51mm Sapphire-2'
  FROM products WHERE slug = 'garmin-epix-pro-gen-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'GARMIN-EPIX-PRO-GEN-2-51mm Sapphire-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Garmin Approach S70', 'garmin-approach-s70', 'Garmin', 'Garmin Approach S70', 'reloj', 'Garmin Approach S70 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{"Caja":"42 mm","Uso":"Golf"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '42mm Golf', 'Negro', '#2c2c2e', 'sellado', 'original', NULL, 899000, 620, 529, 2, 'GARMIN-APPROACH-S70-42mm Golf-1'
  FROM products WHERE slug = 'garmin-approach-s70'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'GARMIN-APPROACH-S70-42mm Golf-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Kieslect Calling Watch Kr3', 'kieslect-calling-watch-kr3', 'Kieslect', 'Kieslect Calling Watch Kr3', 'reloj', 'Kieslect Calling Watch Kr3 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Estándar', 'Denim', '#5f7fb5', 'sellado', 'original', NULL, 116000, 80, 69, 8, 'KIESLECT-CALLING-WATCH-KR3-Estándar-1'
  FROM products WHERE slug = 'kieslect-calling-watch-kr3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'KIESLECT-CALLING-WATCH-KR3-Estándar-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Kieslect Calling Watch Kr Ultra 3', 'kieslect-calling-watch-kr-ultra-3', 'Kieslect', 'Kieslect Calling Watch Kr Ultra 3', 'reloj', 'Kieslect Calling Watch Kr Ultra 3 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Ultra', 'Ice White', '#eef1f4', 'sellado', 'original', NULL, 116000, 80, 69, 8, 'KIESLECT-CALLING-WATCH-KR-ULTRA-3-Ultra-1'
  FROM products WHERE slug = 'kieslect-calling-watch-kr-ultra-3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'KIESLECT-CALLING-WATCH-KR-ULTRA-3-Ultra-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Kieslect Lady Watch Elfin', 'kieslect-lady-watch-elfin', 'Kieslect', 'Kieslect Lady Watch Elfin', 'reloj', 'Kieslect Lady Watch Elfin nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Estándar', 'Negro Grafito', '#3a3a42', 'sellado', 'original', NULL, 116000, 80, 69, 10, 'KIESLECT-LADY-WATCH-ELFIN-Estándar-1'
  FROM products WHERE slug = 'kieslect-lady-watch-elfin'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'KIESLECT-LADY-WATCH-ELFIN-Estándar-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Estándar', 'Rosa Dorado', '#d8a68f', 'sellado', 'original', NULL, 116000, 80, 69, 10, 'KIESLECT-LADY-WATCH-ELFIN-Estándar-2'
  FROM products WHERE slug = 'kieslect-lady-watch-elfin'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'KIESLECT-LADY-WATCH-ELFIN-Estándar-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Estándar', 'Plata', '#c9c9d2', 'sellado', 'original', NULL, 116000, 80, 69, 10, 'KIESLECT-LADY-WATCH-ELFIN-Estándar-3'
  FROM products WHERE slug = 'kieslect-lady-watch-elfin'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'KIESLECT-LADY-WATCH-ELFIN-Estándar-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Kieslect Al Watch Elite 2', 'kieslect-al-watch-elite-2', 'Kieslect', 'Kieslect Al Watch Elite 2', 'reloj', 'Kieslect Al Watch Elite 2 nuevo, sellado y con garantía. Consultanos por disponibilidad de color.', '{}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'Elite', 'Titan Black', '#2c2c34', 'sellado', 'original', NULL, 131000, 90, 79, 6, 'KIESLECT-AL-WATCH-ELITE-2-Elite-1'
  FROM products WHERE slug = 'kieslect-al-watch-elite-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'KIESLECT-AL-WATCH-ELITE-2-Elite-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Neo 13', 'macbook-neo-13', 'Apple', 'MacBook Neo 13', 'notebook', 'MacBook Neo 13 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple A18 Pro, 6 núcleos de CPU y 5 de GPU","Pantalla":"13\" Liquid Retina (2408 × 1506)","Memoria":"8 GB"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 1421000, 980, 830, 2, 'MACBOOK-NEO-13-256GB-1'
  FROM products WHERE slug = 'macbook-neo-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-NEO-13-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Indigo', '#4a5578', 'sellado', 'original', NULL, 1421000, 980, 830, 2, 'MACBOOK-NEO-13-256GB-2'
  FROM products WHERE slug = 'macbook-neo-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-NEO-13-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Blush', '#e8c6c0', 'sellado', 'original', NULL, 1421000, 980, 830, 2, 'MACBOOK-NEO-13-256GB-3'
  FROM products WHERE slug = 'macbook-neo-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-NEO-13-256GB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Citrus', '#e5c063', 'sellado', 'original', NULL, 1421000, 980, 830, 2, 'MACBOOK-NEO-13-256GB-4'
  FROM products WHERE slug = 'macbook-neo-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-NEO-13-256GB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 1610000, 1110, 940, 2, 'MACBOOK-NEO-13-512GB-5'
  FROM products WHERE slug = 'macbook-neo-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-NEO-13-512GB-5');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Indigo', '#4a5578', 'sellado', 'original', NULL, 1610000, 1110, 940, 2, 'MACBOOK-NEO-13-512GB-6'
  FROM products WHERE slug = 'macbook-neo-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-NEO-13-512GB-6');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Blush', '#e8c6c0', 'sellado', 'original', NULL, 1610000, 1110, 940, 2, 'MACBOOK-NEO-13-512GB-7'
  FROM products WHERE slug = 'macbook-neo-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-NEO-13-512GB-7');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Air M5 13', 'macbook-air-m5-13', 'Apple', 'MacBook Air M5 13', 'notebook', 'MacBook Air M5 13 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M5, 10 núcleos de CPU y 10 de GPU","Pantalla":"13.6\" Liquid Retina"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-air-m5-13/1.jpg', 'MacBook Air M5 13 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-air-m5-13'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-air-m5-13' AND pi.url = '/productos/macbook-air-m5-13/1.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 512GB', 'Midnight', '#2e3642', 'sellado', 'original', NULL, 2451000, 1690, 1430, 2, 'MACBOOK-AIR-M5-13-16GB · 512GB-1'
  FROM products WHERE slug = 'macbook-air-m5-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-13-16GB · 512GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 512GB', 'Starlight', '#e9dfd0', 'sellado', 'original', NULL, 2451000, 1690, 1430, 2, 'MACBOOK-AIR-M5-13-16GB · 512GB-2'
  FROM products WHERE slug = 'macbook-air-m5-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-13-16GB · 512GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 1TB', 'Midnight', '#2e3642', 'sellado', 'original', NULL, 2741000, 1890, 1600, 2, 'MACBOOK-AIR-M5-13-16GB · 1TB-3'
  FROM products WHERE slug = 'macbook-air-m5-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-13-16GB · 1TB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 2741000, 1890, 1600, 2, 'MACBOOK-AIR-M5-13-16GB · 1TB-4'
  FROM products WHERE slug = 'macbook-air-m5-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-13-16GB · 1TB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Starlight', '#e9dfd0', 'sellado', 'original', NULL, 3335000, 2300, 1950, 2, 'MACBOOK-AIR-M5-13-24GB · 1TB-5'
  FROM products WHERE slug = 'macbook-air-m5-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-13-24GB · 1TB-5');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Air M5 15', 'macbook-air-m5-15', 'Apple', 'MacBook Air M5 15', 'notebook', 'MacBook Air M5 15 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M5, 10 núcleos de CPU y 10 de GPU","Pantalla":"15.3\" Liquid Retina"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-air-m5-15/1.jpg', 'MacBook Air M5 15 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-air-m5-15' AND pi.url = '/productos/macbook-air-m5-15/1.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 512GB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 2886000, 1990, 1690, 2, 'MACBOOK-AIR-M5-15-16GB · 512GB-1'
  FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-15-16GB · 512GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 512GB', 'Sky Blue', '#a9c3d8', 'sellado', 'original', NULL, 2886000, 1990, 1690, 2, 'MACBOOK-AIR-M5-15-16GB · 512GB-2'
  FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-15-16GB · 512GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 512GB', 'Midnight', '#2e3642', 'sellado', 'original', NULL, 2886000, 1990, 1690, 2, 'MACBOOK-AIR-M5-15-16GB · 512GB-3'
  FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-15-16GB · 512GB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 3930000, 2710, 2300, 2, 'MACBOOK-AIR-M5-15-24GB · 1TB-4'
  FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-15-24GB · 1TB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Sky Blue', '#a9c3d8', 'sellado', 'original', NULL, 3930000, 2710, 2300, 2, 'MACBOOK-AIR-M5-15-24GB · 1TB-5'
  FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-15-24GB · 1TB-5');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Midnight', '#2e3642', 'sellado', 'original', NULL, 3930000, 2710, 2300, 2, 'MACBOOK-AIR-M5-15-24GB · 1TB-6'
  FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-15-24GB · 1TB-6');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Starlight', '#e9dfd0', 'sellado', 'original', NULL, 3930000, 2710, 2300, 2, 'MACBOOK-AIR-M5-15-24GB · 1TB-7'
  FROM products WHERE slug = 'macbook-air-m5-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M5-15-24GB · 1TB-7');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Pro M4 Pro 14', 'macbook-pro-m4-pro-14', 'Apple', 'MacBook Pro M4 Pro 14', 'notebook', 'MacBook Pro M4 Pro 14 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M4 Pro","Pantalla":"14.2\" Liquid Retina XDR"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m4-pro-14/1.jpg', 'MacBook Pro M4 Pro 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m4-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m4-pro-14' AND pi.url = '/productos/macbook-pro-m4-pro-14/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m4-pro-14/2.jpg', 'MacBook Pro M4 Pro 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m4-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m4-pro-14' AND pi.url = '/productos/macbook-pro-m4-pro-14/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m4-pro-14/3.jpg', 'MacBook Pro M4 Pro 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m4-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m4-pro-14' AND pi.url = '/productos/macbook-pro-m4-pro-14/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '12 CPU · 16 GPU · 24GB · 512GB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 3741000, 2580, 2190, 2, 'MACBOOK-PRO-M4-PRO-14-12 CPU · 16 GPU · 24GB · 512GB-1'
  FROM products WHERE slug = 'macbook-pro-m4-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M4-PRO-14-12 CPU · 16 GPU · 24GB · 512GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '14 CPU · 20 GPU · 24GB · 1TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 4191000, 2890, 2450, 2, 'MACBOOK-PRO-M4-PRO-14-14 CPU · 20 GPU · 24GB · 1TB-2'
  FROM products WHERE slug = 'macbook-pro-m4-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M4-PRO-14-14 CPU · 20 GPU · 24GB · 1TB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Pro M5 14', 'macbook-pro-m5-14', 'Apple', 'MacBook Pro M5 14', 'notebook', 'MacBook Pro M5 14 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M5, 10 núcleos de CPU y 10 de GPU","Pantalla":"14.2\" Liquid Retina XDR"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-14/1.jpg', 'MacBook Pro M5 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-14' AND pi.url = '/productos/macbook-pro-m5-14/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-14/2.jpg', 'MacBook Pro M5 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-14' AND pi.url = '/productos/macbook-pro-m5-14/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-14/3.jpg', 'MacBook Pro M5 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-14' AND pi.url = '/productos/macbook-pro-m5-14/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 1TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 3480000, 2400, 2030, 2, 'MACBOOK-PRO-M5-14-16GB · 1TB-1'
  FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-14-16GB · 1TB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '16GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 3480000, 2400, 2030, 2, 'MACBOOK-PRO-M5-14-16GB · 1TB-2'
  FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-14-16GB · 1TB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 4104000, 2830, 2400, 2, 'MACBOOK-PRO-M5-14-24GB · 1TB-3'
  FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-14-24GB · 1TB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 4104000, 2830, 2400, 2, 'MACBOOK-PRO-M5-14-24GB · 1TB-4'
  FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-14-24GB · 1TB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB · teclado español', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 4278000, 2950, 2500, 2, 'MACBOOK-PRO-M5-14-24GB · 1TB · teclado español-5'
  FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-14-24GB · 1TB · teclado español-5');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '32GB · 1TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 4713000, 3250, 2750, 2, 'MACBOOK-PRO-M5-14-32GB · 1TB-6'
  FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-14-32GB · 1TB-6');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '32GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 4713000, 3250, 2750, 2, 'MACBOOK-PRO-M5-14-32GB · 1TB-7'
  FROM products WHERE slug = 'macbook-pro-m5-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-14-32GB · 1TB-7');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Pro M5 Pro 14', 'macbook-pro-m5-pro-14', 'Apple', 'MacBook Pro M5 Pro 14', 'notebook', 'MacBook Pro M5 Pro 14 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M5 Pro","Pantalla":"14.2\" Liquid Retina XDR"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-pro-14/1.jpg', 'MacBook Pro M5 Pro 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-pro-14' AND pi.url = '/productos/macbook-pro-m5-pro-14/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-pro-14/2.jpg', 'MacBook Pro M5 Pro 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-pro-14' AND pi.url = '/productos/macbook-pro-m5-pro-14/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-pro-14/3.jpg', 'MacBook Pro M5 Pro 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-pro-14' AND pi.url = '/productos/macbook-pro-m5-pro-14/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '15 CPU · 16 GPU · 24GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 4539000, 3130, 2650, 2, 'MACBOOK-PRO-M5-PRO-14-15 CPU · 16 GPU · 24GB · 1TB-1'
  FROM products WHERE slug = 'macbook-pro-m5-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-14-15 CPU · 16 GPU · 24GB · 1TB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '15 CPU · 16 GPU · 24GB · 1TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 4539000, 3130, 2650, 2, 'MACBOOK-PRO-M5-PRO-14-15 CPU · 16 GPU · 24GB · 1TB-2'
  FROM products WHERE slug = 'macbook-pro-m5-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-14-15 CPU · 16 GPU · 24GB · 1TB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '18 CPU · 20 GPU · 24GB · 2TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 5699000, 3930, 3330, 2, 'MACBOOK-PRO-M5-PRO-14-18 CPU · 20 GPU · 24GB · 2TB-3'
  FROM products WHERE slug = 'macbook-pro-m5-pro-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-14-18 CPU · 20 GPU · 24GB · 2TB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Pro M5 Max 14', 'macbook-pro-m5-max-14', 'Apple', 'MacBook Pro M5 Max 14', 'notebook', 'MacBook Pro M5 Max 14 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M5 Max","Pantalla":"14.2\" Liquid Retina XDR"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-max-14/1.jpg', 'MacBook Pro M5 Max 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-max-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-max-14' AND pi.url = '/productos/macbook-pro-m5-max-14/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-max-14/2.jpg', 'MacBook Pro M5 Max 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-max-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-max-14' AND pi.url = '/productos/macbook-pro-m5-max-14/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-max-14/3.jpg', 'MacBook Pro M5 Max 14 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-max-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-max-14' AND pi.url = '/productos/macbook-pro-m5-max-14/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '18 CPU · 32 GPU · 36GB · 2TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 7105000, 4900, 4150, 1, 'MACBOOK-PRO-M5-MAX-14-18 CPU · 32 GPU · 36GB · 2TB-1'
  FROM products WHERE slug = 'macbook-pro-m5-max-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-MAX-14-18 CPU · 32 GPU · 36GB · 2TB-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Pro M5 Pro 16', 'macbook-pro-m5-pro-16', 'Apple', 'MacBook Pro M5 Pro 16', 'notebook', 'MacBook Pro M5 Pro 16 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M5 Pro, 18 núcleos de CPU y 20 de GPU","Pantalla":"16.2\" Liquid Retina XDR"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-pro-16/1.jpg', 'MacBook Pro M5 Pro 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-pro-16' AND pi.url = '/productos/macbook-pro-m5-pro-16/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-pro-16/2.jpg', 'MacBook Pro M5 Pro 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-pro-16' AND pi.url = '/productos/macbook-pro-m5-pro-16/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-pro-16/3.jpg', 'MacBook Pro M5 Pro 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-pro-16' AND pi.url = '/productos/macbook-pro-m5-pro-16/3.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-pro-16/4.jpg', 'MacBook Pro M5 Pro 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-pro-16' AND pi.url = '/productos/macbook-pro-m5-pro-16/4.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 5264000, 3630, 3080, 2, 'MACBOOK-PRO-M5-PRO-16-24GB · 1TB-1'
  FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-16-24GB · 1TB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '24GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 5264000, 3630, 3080, 2, 'MACBOOK-PRO-M5-PRO-16-24GB · 1TB-2'
  FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-16-24GB · 1TB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '48GB · 1TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 6757000, 4660, 3950, 2, 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB-3'
  FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '48GB · 1TB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 6757000, 4660, 3950, 2, 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB-4'
  FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '48GB · 1TB · Nano Texture', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 7105000, 4900, 4150, 2, 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB · Nano Texture-5'
  FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB · Nano Texture-5');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '48GB · 1TB · Nano Texture', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 7105000, 4900, 4150, 2, 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB · Nano Texture-6'
  FROM products WHERE slug = 'macbook-pro-m5-pro-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-PRO-16-48GB · 1TB · Nano Texture-6');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Pro M5 Max 16', 'macbook-pro-m5-max-16', 'Apple', 'MacBook Pro M5 Max 16', 'notebook', 'MacBook Pro M5 Max 16 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M5 Max","Pantalla":"16.2\" Liquid Retina XDR"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-max-16/1.jpg', 'MacBook Pro M5 Max 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-max-16' AND pi.url = '/productos/macbook-pro-m5-max-16/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-max-16/2.jpg', 'MacBook Pro M5 Max 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-max-16' AND pi.url = '/productos/macbook-pro-m5-max-16/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-max-16/3.jpg', 'MacBook Pro M5 Max 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-max-16' AND pi.url = '/productos/macbook-pro-m5-max-16/3.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-pro-m5-max-16/4.jpg', 'MacBook Pro M5 Max 16 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-pro-m5-max-16' AND pi.url = '/productos/macbook-pro-m5-max-16/4.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '18 CPU · 32 GPU · 36GB · 2TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 7352000, 5070, 4300, 2, 'MACBOOK-PRO-M5-MAX-16-18 CPU · 32 GPU · 36GB · 2TB-1'
  FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-MAX-16-18 CPU · 32 GPU · 36GB · 2TB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '18 CPU · 40 GPU · 48GB · 2TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 9063000, 6250, 5300, 2, 'MACBOOK-PRO-M5-MAX-16-18 CPU · 40 GPU · 48GB · 2TB-2'
  FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-MAX-16-18 CPU · 40 GPU · 48GB · 2TB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '18 CPU · 40 GPU · 64GB · 2TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 11209000, 7730, 6550, 2, 'MACBOOK-PRO-M5-MAX-16-18 CPU · 40 GPU · 64GB · 2TB-3'
  FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-MAX-16-18 CPU · 40 GPU · 64GB · 2TB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '18 CPU · 40 GPU · 128GB · 2TB', 'Space Black', '#2b2b2d', 'sellado', 'original', NULL, 14718000, 10150, 8600, 1, 'MACBOOK-PRO-M5-MAX-16-18 CPU · 40 GPU · 128GB · 2TB-4'
  FROM products WHERE slug = 'macbook-pro-m5-max-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-PRO-M5-MAX-16-18 CPU · 40 GPU · 128GB · 2TB-4');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPad 11ª generación', 'ipad-11-generacion', 'Apple', 'iPad 11ª generación', 'tablet', 'iPad 11ª generación nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple A16","Pantalla":"11\" Liquid Retina"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 870000, 600, 510, 2, 'IPAD-11-GENERACION-128GB-1'
  FROM products WHERE slug = 'ipad-11-generacion'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-11-GENERACION-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Blue', '#7f9cc0', 'sellado', 'original', NULL, 870000, 600, 510, 2, 'IPAD-11-GENERACION-128GB-2'
  FROM products WHERE slug = 'ipad-11-generacion'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-11-GENERACION-128GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Yellow', '#e8d07a', 'sellado', 'original', NULL, 870000, 600, 510, 2, 'IPAD-11-GENERACION-128GB-3'
  FROM products WHERE slug = 'ipad-11-generacion'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-11-GENERACION-128GB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Blue', '#7f9cc0', 'sellado', 'original', NULL, 1015000, 700, 590, 2, 'IPAD-11-GENERACION-256GB-4'
  FROM products WHERE slug = 'ipad-11-generacion'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-11-GENERACION-256GB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Silver', '#dcdee1', 'sellado', 'original', NULL, 1015000, 700, 590, 2, 'IPAD-11-GENERACION-256GB-5'
  FROM products WHERE slug = 'ipad-11-generacion'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-11-GENERACION-256GB-5');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPad Air 11 M4', 'ipad-air-11-m4', 'Apple', 'iPad Air 11 M4', 'tablet', 'iPad Air 11 M4 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M4","Pantalla":"11\" Liquid Retina"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Blue', '#7f9cc0', 'sellado', 'original', NULL, 1349000, 930, 790, 2, 'IPAD-AIR-11-M4-128GB-1'
  FROM products WHERE slug = 'ipad-air-11-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-11-M4-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Purple', '#b3a7cd', 'sellado', 'original', NULL, 1349000, 930, 790, 2, 'IPAD-AIR-11-M4-128GB-2'
  FROM products WHERE slug = 'ipad-air-11-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-11-M4-128GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Space Gray', '#5c5c5e', 'sellado', 'original', NULL, 1349000, 930, 790, 2, 'IPAD-AIR-11-M4-128GB-3'
  FROM products WHERE slug = 'ipad-air-11-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-11-M4-128GB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Blue', '#7f9cc0', 'sellado', 'original', NULL, 1581000, 1090, 920, 2, 'IPAD-AIR-11-M4-256GB-4'
  FROM products WHERE slug = 'ipad-air-11-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-11-M4-256GB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Space Gray', '#5c5c5e', 'sellado', 'original', NULL, 1581000, 1090, 920, 2, 'IPAD-AIR-11-M4-256GB-5'
  FROM products WHERE slug = 'ipad-air-11-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-11-M4-256GB-5');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPad Air 13 M3', 'ipad-air-13-m3', 'Apple', 'iPad Air 13 M3', 'tablet', 'iPad Air 13 M3 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M3","Pantalla":"13\" Liquid Retina"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Starlight', '#e9dfd0', 'sellado', 'original', NULL, 1494000, 1030, 870, 2, 'IPAD-AIR-13-M3-128GB-1'
  FROM products WHERE slug = 'ipad-air-13-m3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M3-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Blue', '#7f9cc0', 'sellado', 'original', NULL, 1595000, 1100, 930, 2, 'IPAD-AIR-13-M3-256GB-2'
  FROM products WHERE slug = 'ipad-air-13-m3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M3-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Purple', '#b3a7cd', 'sellado', 'original', NULL, 1595000, 1100, 930, 2, 'IPAD-AIR-13-M3-256GB-3'
  FROM products WHERE slug = 'ipad-air-13-m3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M3-256GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPad Air 13 M4', 'ipad-air-13-m4', 'Apple', 'iPad Air 13 M4', 'tablet', 'iPad Air 13 M4 nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.', '{"Chip":"Apple M4","Pantalla":"13\" Liquid Retina"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Space Gray', '#5c5c5e', 'sellado', 'original', NULL, 1639000, 1130, 955, 2, 'IPAD-AIR-13-M4-128GB-1'
  FROM products WHERE slug = 'ipad-air-13-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M4-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Blue', '#7f9cc0', 'sellado', 'original', NULL, 1639000, 1130, 955, 2, 'IPAD-AIR-13-M4-128GB-2'
  FROM products WHERE slug = 'ipad-air-13-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M4-128GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Starlight', '#e9dfd0', 'sellado', 'original', NULL, 1639000, 1130, 955, 2, 'IPAD-AIR-13-M4-128GB-3'
  FROM products WHERE slug = 'ipad-air-13-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M4-128GB-3');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Space Gray', '#5c5c5e', 'sellado', 'original', NULL, 1914000, 1320, 1120, 2, 'IPAD-AIR-13-M4-256GB-4'
  FROM products WHERE slug = 'ipad-air-13-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M4-256GB-4');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Starlight', '#e9dfd0', 'sellado', 'original', NULL, 1914000, 1320, 1120, 2, 'IPAD-AIR-13-M4-256GB-5'
  FROM products WHERE slug = 'ipad-air-13-m4'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-13-M4-256GB-5');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPad Air M2', 'ipad-air-m2', 'Apple', 'iPad Air M2', 'tablet', 'iPad Air de 11" con chip M2. Compatible con Apple Pencil Pro y Magic Keyboard.', '{"Pantalla":"11\" Liquid Retina","Chip":"M2","Cámara":"12 MP gran angular","Batería":"Hasta 10 h de navegación","Conectividad":"Wi-Fi 6E"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Azul', '#7d95ad', 'sellado', 'original', NULL, 1015000, 700, 590, 2, 'IPAD-AIR-M2-128GB-1'
  FROM products WHERE slug = 'ipad-air-m2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-M2-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Gris Espacial', '#57585c', 'a-plus', 'original', 100, 1131000, 780, 660, 1, 'IPAD-AIR-M2-256GB-2'
  FROM products WHERE slug = 'ipad-air-m2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-M2-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Apple Watch Series 10', 'apple-watch-series-10', 'Apple', 'Apple Watch Series 10', 'reloj', 'La pantalla más grande y el cuerpo más delgado de la historia del Apple Watch.', '{"Caja":"46 mm aluminio","Pantalla":"LTPO3 OLED siempre activa","Sensores":"ECG, oxígeno en sangre, temperatura","Batería":"Hasta 18 h","Resistencia":"50 m"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '46mm GPS', 'Titanio Natural', '#c2bcb2', 'sellado', 'original', NULL, 653000, 450, 378, 3, 'APPLE-WATCH-SERIES-10-46mm GPS-1'
  FROM products WHERE slug = 'apple-watch-series-10'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'APPLE-WATCH-SERIES-10-46mm GPS-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '42mm GPS', 'Medianoche', '#2c2c34', 'sellado', 'original', NULL, 580000, 400, 336, 2, 'APPLE-WATCH-SERIES-10-42mm GPS-2'
  FROM products WHERE slug = 'apple-watch-series-10'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'APPLE-WATCH-SERIES-10-42mm GPS-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('AirPods Pro 2', 'airpods-pro-2', 'Apple', 'AirPods Pro 2', 'audio', 'Cancelación activa de ruido, Audio Adaptativo y estuche con USB-C. También funcionan como audífonos.', '{"Chip":"H2","Cancelación":"Activa, hasta 2x más efectiva","Batería":"6 h + 30 h con el estuche","Estuche":"USB-C con MagSafe","Resistencia":"IP54"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'USB-C', 'Blanco', '#f5f5f7', 'sellado', 'original', NULL, 319000, 220, 182, 8, 'AIRPODS-PRO-2-USB-C-1'
  FROM products WHERE slug = 'airpods-pro-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'AIRPODS-PRO-2-USB-C-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Air M3', 'macbook-air-m3', 'Apple', 'MacBook Air M3', 'notebook', 'MacBook Air de 13" con chip M3. Silencioso, delgado y con casi 18 horas de batería.', '{"Pantalla":"13.6\" Liquid Retina","Chip":"M3 de 8 núcleos","Memoria":"8 GB unificada","Batería":"Hasta 18 h","Puertos":"2× Thunderbolt, MagSafe 3"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/macbook-air-m3/1.jpg', 'MacBook Air M3 Apple en venta en La Plata', 0 FROM products WHERE slug = 'macbook-air-m3'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-air-m3' AND pi.url = '/productos/macbook-air-m3/1.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Medianoche', '#2c2c34', 'sellado', 'original', NULL, 1668000, 1150, 970, 1, 'MACBOOK-AIR-M3-256GB-1'
  FROM products WHERE slug = 'macbook-air-m3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M3-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Blanco Estelar', '#f0ece4', 'a-plus', 'original', 99, 1871000, 1290, 1090, 1, 'MACBOOK-AIR-M3-512GB-2'
  FROM products WHERE slug = 'macbook-air-m3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M3-512GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('PlayStation 5 Slim', 'playstation-5-slim', 'Sony', 'PlayStation 5 Slim', 'consola', 'PS5 Slim con lectora de discos. Más chica y liviana que la original, mismo rendimiento.', '{"Almacenamiento":"1 TB SSD","Resolución":"Hasta 4K 120 Hz","Lectora":"Blu-ray Ultra HD","Incluye":"Un joystick DualSense"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/playstation-5-slim/1.jpg', 'PlayStation 5 Slim Sony en venta en La Plata', 0 FROM products WHERE slug = 'playstation-5-slim'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'playstation-5-slim' AND pi.url = '/productos/playstation-5-slim/1.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/playstation-5-slim/2.jpg', 'PlayStation 5 Slim Sony en venta en La Plata', 0 FROM products WHERE slug = 'playstation-5-slim'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'playstation-5-slim' AND pi.url = '/productos/playstation-5-slim/2.jpg');
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, '/productos/playstation-5-slim/3.jpg', 'PlayStation 5 Slim Sony en venta en La Plata', 0 FROM products WHERE slug = 'playstation-5-slim'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'playstation-5-slim' AND pi.url = '/productos/playstation-5-slim/3.jpg');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '1TB', 'Blanco', '#f2f2f2', 'sellado', 'original', NULL, 899000, 620, 520, 2, 'PLAYSTATION-5-SLIM-1TB-1'
  FROM products WHERE slug = 'playstation-5-slim'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'PLAYSTATION-5-SLIM-1TB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '1TB', 'Blanco', '#f2f2f2', 'a-plus', 'original', NULL, 783000, 540, 452, 1, 'PLAYSTATION-5-SLIM-1TB-2'
  FROM products WHERE slug = 'playstation-5-slim'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'PLAYSTATION-5-SLIM-1TB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Smartwatch estilo Watch Ultra', 'smartwatch-estilo-watch-ultra', 'Genérico', 'Smartwatch estilo Watch Ultra', 'accesorio', 'Réplica de línea premium. No es un Apple Watch: no corre watchOS ni se integra con el ecosistema de Apple.', '{"Pantalla":"1.9\" AMOLED","Batería":"Hasta 7 días","Compatibilidad":"Android e iOS por app propia","Resistencia":"IP68"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '49mm', 'Titanio', '#c2bcb2', 'sellado', 'replica', NULL, 65000, 45, 28, 12, 'SMARTWATCH-ESTILO-WATCH-ULTRA-49mm-1'
  FROM products WHERE slug = 'smartwatch-estilo-watch-ultra'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'SMARTWATCH-ESTILO-WATCH-ULTRA-49mm-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Auriculares estilo AirPods Pro', 'auriculares-estilo-airpods-pro', 'Genérico', 'Auriculares estilo AirPods Pro', 'accesorio', 'Réplica con cancelación de ruido. No son AirPods originales: no tienen chip H2 ni integración nativa con iOS.', '{"Cancelación":"Activa básica","Batería":"4 h + 20 h con estuche","Conexión":"Bluetooth 5.3","Estuche":"USB-C"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_variants (product_id, storage, color, color_hex, grade, authenticity, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'USB-C', 'Blanco', '#f5f5f7', 'sellado', 'replica', NULL, 36000, 25, 14, 20, 'AURICULARES-ESTILO-AIRPODS-PRO-USB-C-1'
  FROM products WHERE slug = 'auriculares-estilo-airpods-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'AURICULARES-ESTILO-AIRPODS-PRO-USB-C-1');

-- Servicios de reparación
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Cambio de pantalla', 'iPhone 11 a 16 Pro Max', 'Módulo original o calidad premium según disponibilidad. Incluye prueba de Face ID y True Tone.', 85000, '1 a 2 h', 0, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Cambio de pantalla');
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Cambio de batería', 'iPhone 11 a 16 Pro Max', 'Batería nueva con ciclo cero. Recuperás la autonomía original del equipo.', 55000, '45 min', 1, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Cambio de batería');
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Cambio de pin de carga', 'iPhone y iPad', 'Reemplazo del puerto Lightning o USB-C cuando el equipo no carga o carga intermitente.', 48000, '1 h', 2, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Cambio de pin de carga');
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Cambio de tapa trasera', 'iPhone 8 a 16 Pro Max', 'Reemplazo del vidrio trasero por láser, sin afectar la carga inalámbrica.', 65000, '2 h', 3, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Cambio de tapa trasera');
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Reparación de cámara', 'iPhone 11 a 16 Pro Max', 'Cámara trasera o frontal con fallas de enfoque, manchas o pantalla negra al abrir la app.', 72000, '1 a 2 h', 4, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Reparación de cámara');
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Cambio de altavoz o micrófono', 'iPhone y iPad', 'Para equipos donde no se escucha en llamada o el otro lado no te escucha a vos.', 42000, '1 h', 5, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Cambio de altavoz o micrófono');
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Recuperación por daño de líquido', 'iPhone y iPad', 'Limpieza ultrasónica de placa y diagnóstico. Se presupuesta después de revisarlo.', 60000, '24 a 72 h', 6, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Recuperación por daño de líquido');
INSERT INTO repair_services (name, device, description, price_from, duration, sort_order, is_active)
  SELECT 'Diagnóstico completo', 'Todos los equipos Apple', 'Revisión de batería, pantalla, cámaras, sensores y placa. Sin cargo si hacés la reparación acá.', 0, '30 min', 7, TRUE
  WHERE NOT EXISTS (SELECT 1 FROM repair_services WHERE name = 'Diagnóstico completo');

-- Valores de referencia del Plan Canje
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17', '128GB', 755)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17', '256GB', 835)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17 Pro', '128GB', 970)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17 Pro', '256GB', 1050)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17 Pro', '512GB', 1190)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17 Pro Max', '256GB', 1195)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17 Pro Max', '512GB', 1330)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 17 Pro Max', '1TB', 1490)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16', '128GB', 665)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16', '256GB', 740)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16 Pro', '128GB', 875)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16 Pro', '256GB', 950)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16 Pro', '512GB', 1085)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16 Pro Max', '256GB', 1090)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16 Pro Max', '512GB', 1225)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16 Pro Max', '1TB', 1380)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15', '128GB', 545)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15', '256GB', 620)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro', '128GB', 715)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro', '256GB', 790)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro', '512GB', 920)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro Max', '256GB', 925)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro Max', '512GB', 1055)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro Max', '1TB', 1205)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14', '128GB', 430)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14', '256GB', 500)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14 Pro', '128GB', 560)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14 Pro', '256GB', 635)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14 Pro', '512GB', 760)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14 Pro Max', '256GB', 735)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14 Pro Max', '512GB', 860)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14 Pro Max', '1TB', 1005)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13', '128GB', 335)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13', '256GB', 405)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13 Pro', '128GB', 450)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13 Pro', '256GB', 520)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13 Pro', '512GB', 640)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13 Pro Max', '256GB', 595)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13 Pro Max', '512GB', 715)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13 Pro Max', '1TB', 860)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12', '128GB', 250)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12', '256GB', 315)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12 Pro', '128GB', 340)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12 Pro', '256GB', 410)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12 Pro', '512GB', 525)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12 Pro Max', '256GB', 470)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12 Pro Max', '512GB', 590)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12 Pro Max', '1TB', 725)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11', '128GB', 180)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11', '256GB', 245)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11 Pro', '128GB', 250)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11 Pro', '256GB', 320)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11 Pro', '512GB', 430)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11 Pro Max', '256GB', 365)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11 Pro Max', '512GB', 480)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11 Pro Max', '1TB', 610)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;

-- Notas del blog
INSERT INTO posts (title, slug, excerpt, body, cover_url, author, is_published, published_at)
  VALUES ('iPhone 16 vs iPhone 15: ¿conviene el salto?', 'iphone-16-vs-iphone-15', 'Comparamos las dos generaciones en cámara, batería y rendimiento real para ayudarte a decidir si el cambio vale la pena.', 'El iPhone 16 trajo el chip A18, el botón de Control de Cámara y una mejora concreta en batería. Pero si venís de un iPhone 15, la pregunta es si esas diferencias justifican el cambio.

## Rendimiento

El A18 rinde entre un 20 y un 25 % más que el A16 del iPhone 15 en tareas exigentes. En uso diario —redes, mensajes, cámara— la diferencia es casi imperceptible. Se nota en edición de video y juegos pesados.

## Cámara

Los dos tienen sensor principal de 48 MP. El 16 suma un ultra gran angular con enfoque automático que habilita macro, algo que el 15 no puede hacer. Si sacás muchas fotos de cerca, es el argumento más fuerte.

## Batería

El 16 rinde alrededor de dos horas más de video. Si tu 15 ya tiene la batería por debajo del 85 %, cambiar la batería puede resolverte el problema por mucho menos plata.

## Conclusión

Si venís de un iPhone 13 o anterior, el salto al 16 se siente muchísimo. Si tenés un 15 en buen estado, esperá una generación más — o traelo por Plan Canje cuando salga el 17.', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80', 'Equipo iPhone Purple', TRUE, '2026-08-18')
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO posts (title, slug, excerpt, body, cover_url, author, is_published, published_at)
  VALUES ('Cómo saber si un iPhone usado está en buen estado', 'como-revisar-un-iphone-usado', 'Los seis chequeos que hacemos en cada equipo antes de publicarlo, para que puedas hacerlos vos también.', 'Comprar un iPhone usado es una gran decisión si sabés qué mirar. Estos son los chequeos que hacemos nosotros en cada equipo antes de que entre al catálogo.

## 1. Salud de la batería

Ajustes → Batería → Salud de la batería. Por debajo de 80 % el equipo empieza a limitar rendimiento. Nosotros no publicamos nada por debajo de 80, y siempre informamos el número exacto.

## 2. Que no esté bloqueado

Ajustes → General → Información. Si aparece "Bloqueo de activación", el equipo está atado a otra cuenta de iCloud y es inutilizable. Es el chequeo más importante de todos.

## 3. Número de serie

Verificalo en la página de cobertura de Apple. Te confirma el modelo real y si tiene garantía vigente.

## 4. Piezas originales

Ajustes → General → Información → Piezas y servicio. Ahí figura si la pantalla o la batería fueron cambiadas y si son originales.

## 5. Cámaras y sensores

Sacá una foto con cada lente, probá el Face ID y hacé una llamada. Son treinta segundos que evitan sorpresas.

## 6. Prueba de carga

Enchufalo y movelo. Si la carga se corta al mover el cable, el pin está gastado.

Todos los equipos que vendemos pasan por estos seis pasos y van con garantía escrita.', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80', 'Equipo iPhone Purple', TRUE, '2026-07-30')
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO posts (title, slug, excerpt, body, cover_url, author, is_published, published_at)
  VALUES ('Plan Canje: cómo calculamos lo que vale tu equipo', 'como-calculamos-el-plan-canje', 'No hay misterio ni letra chica. Te contamos exactamente qué mira nuestra tasación y por qué.', 'Mucha gente llega desconfiando del canje, y se entiende. Así que preferimos mostrar cómo se arma el número.

## El valor base

Cada modelo y capacidad tiene un valor de referencia que actualizamos todas las semanas según cómo se mueve el mercado local. Ese valor corresponde a un equipo en estado muy bueno.

## El estado

Sobre ese valor base aplicamos un ajuste según el estado real:

- **Como nuevo**: sin marcas de uso, batería arriba de 95 % → +15 %
- **Muy bueno**: micromarcas que no se ven de frente, batería arriba de 88 % → valor base
- **Bueno**: rayas visibles o batería entre 80 y 88 % → −15 %
- **Con detalles**: pantalla o tapa rotas, batería debajo de 80 % → se cotiza aparte

## Lo que suma

Caja, cable original y accesorios suman un poco. La factura de compra también, porque nos permite revenderlo con más confianza.

## Lo que resta

Bloqueo de iCloud pendiente, pantalla no original o daño por líquido cambian bastante el número. Nada de esto lo descubrimos después: lo revisamos con vos en el mostrador.

Podés cotizar online en dos minutos y después traerlo para confirmar. El valor que te damos online se respeta si el equipo está como lo describiste.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', 'Equipo iPhone Purple', TRUE, '2026-07-12')
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO posts (title, slug, excerpt, body, cover_url, author, is_published, published_at)
  VALUES ('Cuánto dura realmente la batería de un iPhone', 'cuanto-dura-la-bateria-de-un-iphone', 'Ciclos, porcentaje de salud y los hábitos que más la desgastan. Qué esperar y cuándo conviene cambiarla.', 'La batería es la pieza que más consultas nos genera. Vamos con los números concretos.

## Los ciclos

Apple diseña las baterías de iPhone para conservar el 80 % de su capacidad después de 500 ciclos completos de carga —1000 en los modelos desde el iPhone 15. Un uso normal es de un ciclo por día, así que hablamos de entre año y medio y tres años.

## Qué significa el porcentaje

El número de "Salud de la batería" es capacidad máxima respecto de una batería nueva. Al 85 % tu equipo dura un 15 % menos que el primer día. Debajo de 80 %, iOS puede empezar a limitar el rendimiento para evitar apagones.

## Lo que más la desgasta

El calor, sobre todo. Dejar el equipo al sol o cargarlo dentro de una funda gruesa envejece la batería mucho más rápido que la cantidad de cargas. Cargarlo de noche no le hace mal: iOS administra la carga final.

## Cuándo cambiarla

Si estás por debajo de 85 % y te queda corto el día, el cambio de batería es la mejor inversión posible: por una fracción del precio de un equipo nuevo, recuperás la autonomía original.', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80', 'Equipo iPhone Purple', TRUE, '2026-06-25')
  ON CONFLICT (slug) DO NOTHING;

COMMIT;
