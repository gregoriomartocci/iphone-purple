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
INSERT INTO store_settings (key, value) VALUES ('address', '"Av. Corrientes 1234, CABA"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('hours', '"Lunes a sábado de 10 a 19 h"'::jsonb)
  ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('mapsUrl', '"https://maps.google.com/?q=Av.+Corrientes+1234,+CABA"'::jsonb)
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
  VALUES ('iPhone 16 Pro Max', 'iphone-16-pro-max', 'Apple', 'iPhone 16 Pro Max', 'iphone', 'El iPhone más grande y más rápido. Titanio, chip A18 Pro y el sistema de cámaras más completo que hizo Apple.', '{"Pantalla":"6.9\" Super Retina XDR ProMotion","Chip":"A18 Pro","Cámara":"48 MP principal + ultra gran angular + teleobjetivo 5x","Batería":"Hasta 33 h de video","Material":"Titanio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', 'iPhone 16 Pro Max', 0 FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro-max' AND pi.url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Desierto', '#bfa48f', 'nuevo', NULL, 2248000, 1550, 1310, 3, 'IPHONE-16-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Titanio Natural', '#c2bcb2', 'nuevo', NULL, 2581000, 1780, 1510, 1, 'IPHONE-16-PRO-MAX-512GB-2'
  FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-MAX-512GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Negro', '#3b3b3d', 'como-nuevo', 99, 2001000, 1380, 1170, 2, 'IPHONE-16-PRO-MAX-256GB-3'
  FROM products WHERE slug = 'iphone-16-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-MAX-256GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 16 Pro', 'iphone-16-pro', 'Apple', 'iPhone 16 Pro', 'iphone', 'Todo el poder del A18 Pro en un cuerpo más manejable. Botón de Control de Cámara y grabación en 4K120.', '{"Pantalla":"6.3\" Super Retina XDR ProMotion","Chip":"A18 Pro","Cámara":"48 MP principal + teleobjetivo 5x","Batería":"Hasta 27 h de video","Material":"Titanio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', 'iPhone 16 Pro', 0 FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16-pro' AND pi.url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Natural', '#c2bcb2', 'nuevo', NULL, 1958000, 1350, 1140, 4, 'IPHONE-16-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Negro', '#3b3b3d', 'nuevo', NULL, 2132000, 1470, 1245, 2, 'IPHONE-16-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Blanco', '#e8e4dd', 'muy-bueno', 94, 1668000, 1150, 975, 1, 'IPHONE-16-PRO-128GB-3'
  FROM products WHERE slug = 'iphone-16-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-PRO-128GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 16', 'iphone-16', 'Apple', 'iPhone 16', 'iphone', 'Chip A18, cámara de 48 MP y Control de Cámara. El equilibrio justo entre precio y potencia.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A18","Cámara":"48 MP principal + ultra gran angular","Batería":"Hasta 22 h de video","Material":"Aluminio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80', 'iPhone 16', 0 FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-16' AND pi.url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Ultramarino', '#8fa5cc', 'nuevo', NULL, 1450000, 1000, 845, 5, 'IPHONE-16-128GB-1'
  FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Verde Azulado', '#a8c4bd', 'nuevo', NULL, 1624000, 1120, 950, 3, 'IPHONE-16-256GB-2'
  FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Negro', '#2c2c2e', 'nuevo', NULL, 1450000, 1000, 845, 2, 'IPHONE-16-128GB-3'
  FROM products WHERE slug = 'iphone-16'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-16-128GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 15 Pro Max', 'iphone-15-pro-max', 'Apple', 'iPhone 15 Pro Max', 'iphone', 'Titanio, A17 Pro y teleobjetivo 5x. Uno de los equipos con mejor relación precio-calidad del catálogo.', '{"Pantalla":"6.7\" Super Retina XDR ProMotion","Chip":"A17 Pro","Cámara":"48 MP + teleobjetivo 5x","Batería":"Hasta 29 h de video","Material":"Titanio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', 'iPhone 15 Pro Max', 0 FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15-pro-max' AND pi.url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Natural', '#c2bcb2', 'como-nuevo', 97, 1624000, 1120, 950, 2, 'IPHONE-15-PRO-MAX-256GB-1'
  FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-MAX-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Azul', '#5f6b7a', 'muy-bueno', 91, 1465000, 1010, 855, 1, 'IPHONE-15-PRO-MAX-256GB-2'
  FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-MAX-256GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Titanio Negro', '#3b3b3d', 'muy-bueno', 89, 1711000, 1180, 1000, 1, 'IPHONE-15-PRO-MAX-512GB-3'
  FROM products WHERE slug = 'iphone-15-pro-max'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-MAX-512GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 15 Pro', 'iphone-15-pro', 'Apple', 'iPhone 15 Pro', 'iphone', 'El primer iPhone de titanio en formato compacto. USB-C, A17 Pro y botón de Acción.', '{"Pantalla":"6.1\" Super Retina XDR ProMotion","Chip":"A17 Pro","Cámara":"48 MP + teleobjetivo 3x","Batería":"Hasta 23 h de video","Material":"Titanio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', 'iPhone 15 Pro', 0 FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15-pro' AND pi.url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Titanio Negro', '#3b3b3d', 'muy-bueno', 92, 1262000, 870, 735, 3, 'IPHONE-15-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Titanio Blanco', '#e8e4dd', 'como-nuevo', 98, 1421000, 980, 830, 1, 'IPHONE-15-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-15-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-PRO-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 15', 'iphone-15', 'Apple', 'iPhone 15', 'iphone', 'Dynamic Island, cámara de 48 MP y USB-C. Sigue siendo la mejor puerta de entrada a iOS.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A16 Bionic","Cámara":"48 MP principal + ultra gran angular","Batería":"Hasta 20 h de video","Material":"Aluminio"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80', 'iPhone 15', 0 FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-15' AND pi.url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Rosa', '#f0d5d8', 'nuevo', NULL, 1189000, 820, 690, 4, 'IPHONE-15-128GB-1'
  FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Negro', '#2c2c2e', 'muy-bueno', 93, 1015000, 700, 590, 2, 'IPHONE-15-128GB-2'
  FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-128GB-2');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Azul', '#b4c8d8', 'muy-bueno', 90, 1131000, 780, 660, 1, 'IPHONE-15-256GB-3'
  FROM products WHERE slug = 'iphone-15'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-15-256GB-3');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 14 Pro', 'iphone-14-pro', 'Apple', 'iPhone 14 Pro', 'iphone', 'El que estrenó la Dynamic Island. Pantalla siempre activa y cámara de 48 MP a muy buen precio.', '{"Pantalla":"6.1\" Super Retina XDR ProMotion","Chip":"A16 Bionic","Cámara":"48 MP + teleobjetivo 3x","Batería":"Hasta 23 h de video","Material":"Acero inoxidable"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', 'iPhone 14 Pro', 0 FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14-pro' AND pi.url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Morado Oscuro', '#5b5069', 'muy-bueno', 88, 1015000, 700, 590, 2, 'IPHONE-14-PRO-128GB-1'
  FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Negro Espacial', '#3a3a3c', 'muy-bueno', 91, 1131000, 780, 660, 1, 'IPHONE-14-PRO-256GB-2'
  FROM products WHERE slug = 'iphone-14-pro'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-PRO-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 14', 'iphone-14', 'Apple', 'iPhone 14', 'iphone', 'Batería para todo el día y cámaras muy sólidas. La opción más elegida por relación precio-calidad.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A15 Bionic","Cámara":"12 MP principal + ultra gran angular","Batería":"Hasta 20 h de video","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80', 'iPhone 14', 0 FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-14' AND pi.url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Medianoche', '#2c2c34', 'muy-bueno', 89, 870000, 600, 505, 3, 'IPHONE-14-128GB-1'
  FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Blanco Estelar', '#f0ece4', 'bueno', 84, 783000, 540, 455, 2, 'IPHONE-14-128GB-2'
  FROM products WHERE slug = 'iphone-14'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-14-128GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 13', 'iphone-13', 'Apple', 'iPhone 13', 'iphone', 'Un clásico que no baja el nivel. Excelente batería y cámara con modo Cinemático.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A15 Bionic","Cámara":"12 MP dual","Batería":"Hasta 19 h de video","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80', 'iPhone 13', 0 FROM products WHERE slug = 'iphone-13'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-13' AND pi.url = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Medianoche', '#2c2c34', 'muy-bueno', 87, 682000, 470, 395, 4, 'IPHONE-13-128GB-1'
  FROM products WHERE slug = 'iphone-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Azul', '#87a6c4', 'bueno', 83, 740000, 510, 430, 1, 'IPHONE-13-256GB-2'
  FROM products WHERE slug = 'iphone-13'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-13-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 12', 'iphone-12', 'Apple', 'iPhone 12', 'iphone', 'Pantalla OLED y 5G en el rango más accesible. Ideal como primer iPhone.', '{"Pantalla":"6.1\" Super Retina XDR","Chip":"A14 Bionic","Cámara":"12 MP dual","Batería":"Hasta 17 h de video","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80', 'iPhone 12', 0 FROM products WHERE slug = 'iphone-12'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-12' AND pi.url = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '64GB', 'Negro', '#2c2c2e', 'bueno', 82, 479000, 330, 275, 3, 'IPHONE-12-64GB-1'
  FROM products WHERE slug = 'iphone-12'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-64GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Verde', '#c9ddc4', 'muy-bueno', 86, 566000, 390, 328, 2, 'IPHONE-12-128GB-2'
  FROM products WHERE slug = 'iphone-12'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-12-128GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPhone 11', 'iphone-11', 'Apple', 'iPhone 11', 'iphone', 'El más vendido de su generación. Batería enorme y buen rendimiento para el uso diario.', '{"Pantalla":"6.1\" Liquid Retina HD","Chip":"A13 Bionic","Cámara":"12 MP dual","Batería":"Hasta 17 h de video","Material":"Aluminio"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80', 'iPhone 11', 0 FROM products WHERE slug = 'iphone-11'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'iphone-11' AND pi.url = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '64GB', 'Blanco', '#f2f2f0', 'bueno', 81, 363000, 250, 208, 2, 'IPHONE-11-64GB-1'
  FROM products WHERE slug = 'iphone-11'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-64GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Negro', '#2c2c2e', 'bueno', 80, 421000, 290, 242, 0, 'IPHONE-11-128GB-2'
  FROM products WHERE slug = 'iphone-11'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPHONE-11-128GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('iPad Air M2', 'ipad-air-m2', 'Apple', 'iPad Air M2', 'ipad', 'iPad Air de 11" con chip M2. Compatible con Apple Pencil Pro y Magic Keyboard.', '{"Pantalla":"11\" Liquid Retina","Chip":"M2","Cámara":"12 MP gran angular","Batería":"Hasta 10 h de navegación","Conectividad":"Wi-Fi 6E"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80', 'iPad Air M2', 0 FROM products WHERE slug = 'ipad-air-m2'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'ipad-air-m2' AND pi.url = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '128GB', 'Azul', '#7d95ad', 'nuevo', NULL, 1015000, 700, 590, 2, 'IPAD-AIR-M2-128GB-1'
  FROM products WHERE slug = 'ipad-air-m2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-M2-128GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Gris Espacial', '#57585c', 'como-nuevo', 100, 1131000, 780, 660, 1, 'IPAD-AIR-M2-256GB-2'
  FROM products WHERE slug = 'ipad-air-m2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'IPAD-AIR-M2-256GB-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('Apple Watch Series 10', 'apple-watch-series-10', 'Apple', 'Apple Watch Series 10', 'watch', 'La pantalla más grande y el cuerpo más delgado de la historia del Apple Watch.', '{"Caja":"46 mm aluminio","Pantalla":"LTPO3 OLED siempre activa","Sensores":"ECG, oxígeno en sangre, temperatura","Batería":"Hasta 18 h","Resistencia":"50 m"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80', 'Apple Watch Series 10', 0 FROM products WHERE slug = 'apple-watch-series-10'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'apple-watch-series-10' AND pi.url = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '46mm GPS', 'Titanio Natural', '#c2bcb2', 'nuevo', NULL, 653000, 450, 378, 3, 'APPLE-WATCH-SERIES-10-46mm GPS-1'
  FROM products WHERE slug = 'apple-watch-series-10'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'APPLE-WATCH-SERIES-10-46mm GPS-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '42mm GPS', 'Medianoche', '#2c2c34', 'nuevo', NULL, 580000, 400, 336, 2, 'APPLE-WATCH-SERIES-10-42mm GPS-2'
  FROM products WHERE slug = 'apple-watch-series-10'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'APPLE-WATCH-SERIES-10-42mm GPS-2');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('AirPods Pro 2', 'airpods-pro-2', 'Apple', 'AirPods Pro 2', 'audio', 'Cancelación activa de ruido, Audio Adaptativo y estuche con USB-C. También funcionan como audífonos.', '{"Chip":"H2","Cancelación":"Activa, hasta 2x más efectiva","Batería":"6 h + 30 h con el estuche","Estuche":"USB-C con MagSafe","Resistencia":"IP54"}'::jsonb, 'active', TRUE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=80', 'AirPods Pro 2', 0 FROM products WHERE slug = 'airpods-pro-2'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'airpods-pro-2' AND pi.url = 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, 'USB-C', 'Blanco', '#f5f5f7', 'nuevo', NULL, 319000, 220, 182, 8, 'AIRPODS-PRO-2-USB-C-1'
  FROM products WHERE slug = 'airpods-pro-2'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'AIRPODS-PRO-2-USB-C-1');

INSERT INTO products (name, slug, brand, model, category, description, specs, status, is_featured)
  VALUES ('MacBook Air M3', 'macbook-air-m3', 'Apple', 'MacBook Air M3', 'mac', 'MacBook Air de 13" con chip M3. Silencioso, delgado y con casi 18 horas de batería.', '{"Pantalla":"13.6\" Liquid Retina","Chip":"M3 de 8 núcleos","Memoria":"8 GB unificada","Batería":"Hasta 18 h","Puertos":"2× Thunderbolt, MagSafe 3"}'::jsonb, 'active', FALSE)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_images (product_id, url, alt, sort_order)
  SELECT id, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', 'MacBook Air M3', 0 FROM products WHERE slug = 'macbook-air-m3'
  AND NOT EXISTS (SELECT 1 FROM product_images pi JOIN products pr ON pr.id = pi.product_id
                  WHERE pr.slug = 'macbook-air-m3' AND pi.url = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '256GB', 'Medianoche', '#2c2c34', 'nuevo', NULL, 1668000, 1150, 970, 1, 'MACBOOK-AIR-M3-256GB-1'
  FROM products WHERE slug = 'macbook-air-m3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M3-256GB-1');
INSERT INTO product_variants (product_id, storage, color, color_hex, condition, battery_health, price_ars, price_usd, cost_usd, stock, sku)
  SELECT id, '512GB', 'Blanco Estelar', '#f0ece4', 'como-nuevo', 99, 1871000, 1290, 1090, 1, 'MACBOOK-AIR-M3-512GB-2'
  FROM products WHERE slug = 'macbook-air-m3'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = 'MACBOOK-AIR-M3-512GB-2');

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
  VALUES ('Apple', 'iPhone 16 Pro Max', '256GB', 1120)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16 Pro', '128GB', 950)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 16', '128GB', 700)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro Max', '256GB', 830)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15 Pro', '128GB', 690)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 15', '128GB', 540)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14 Pro', '128GB', 530)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 14', '128GB', 420)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 13', '128GB', 330)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 12', '64GB', 220)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Apple', 'iPhone 11', '64GB', 160)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Samsung', 'Galaxy S24 Ultra', '256GB', 560)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Samsung', 'Galaxy S23', '128GB', 300)
  ON CONFLICT (brand, model, storage) DO UPDATE SET base_value = EXCLUDED.base_value;
INSERT INTO trade_in_prices (brand, model, storage, base_value)
  VALUES ('Xiaomi', 'Redmi Note 13 Pro', '256GB', 130)
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

Si estás por debajo de 85 % y te queda corto el día, el cambio de batería es la mejor inversión posible: por una fracción del precio de un equipo nuevo, recuperás la autonomía original.', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=80', 'Equipo iPhone Purple', TRUE, '2026-06-25')
  ON CONFLICT (slug) DO NOTHING;

COMMIT;
