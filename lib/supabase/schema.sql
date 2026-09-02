-- iPhone Purple — esquema
-- Catálogo de equipos Apple, Plan Canje, reparaciones, blog y panel interno.
-- No hay venta online: las ventas se registran a mano desde el panel.
--
-- Aplicar en el SQL Editor de Supabase, y después `seed.sql`.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------- usuarios

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------- catálogo

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Apple',
  -- Familia del equipo ("iPhone 15 Pro"): agrupa variantes y alimenta los filtros.
  model TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'iphone',
  description TEXT,
  specs JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Una fila por combinación concreta que se puede vender: capacidad + color + estado.
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  storage TEXT NOT NULL,
  color TEXT,
  color_hex TEXT,
  condition TEXT NOT NULL DEFAULT 'muy-bueno'
    CHECK (condition IN ('nuevo', 'como-nuevo', 'muy-bueno', 'bueno')),
  battery_health INT CHECK (battery_health BETWEEN 0 AND 100),
  price_ars DECIMAL(12,2) NOT NULL,
  price_usd DECIMAL(10,2),
  -- Costo del proveedor. Nunca sale al sitio público: solo alimenta el margen.
  cost_usd DECIMAL(10,2),
  stock INT DEFAULT 0,
  sku TEXT,
  supplier_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT DEFAULT 0
);

-- ---------------------------------------------------------------- proveedores

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  -- Margen que se propone al importar una lista de este proveedor. 18 = +18%.
  default_margin_pct DECIMAL(5,2) DEFAULT 18,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de cada lista de WhatsApp pegada en el panel.
-- Guardamos el texto original además del resultado: si el parseo sale mal,
-- se puede revisar contra lo que mandó el proveedor.
CREATE TABLE IF NOT EXISTS supplier_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  raw_text TEXT NOT NULL,
  parsed_json JSONB DEFAULT '[]',
  margin_pct DECIMAL(5,2),
  dollar_rate DECIMAL(12,2),
  rows_published INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'discarded')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_variants
  DROP CONSTRAINT IF EXISTS product_variants_supplier_id_fkey;
ALTER TABLE product_variants
  ADD CONSTRAINT product_variants_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

-- ---------------------------------------------------------------- ventas

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number TEXT UNIQUE NOT NULL,
  variant_id UUID REFERENCES product_variants(id),
  -- Se copian nombre y variante al momento de vender: si después borrás el
  -- producto, la venta sigue siendo legible.
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  cost_price DECIMAL(12,2),
  quantity INT NOT NULL DEFAULT 1,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  payment_method TEXT DEFAULT 'efectivo'
    CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta', 'canje')),
  notes TEXT,
  sold_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- ---------------------------------------------------------------- plan canje

-- Valor de referencia por modelo, para un equipo en estado "muy-bueno".
-- El cotizador aplica encima el ajuste por estado.
CREATE TABLE IF NOT EXISTS trade_in_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  storage TEXT NOT NULL,
  base_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (brand, model, storage)
);

CREATE TABLE IF NOT EXISTS trade_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  storage TEXT,
  condition TEXT NOT NULL
    CHECK (condition IN ('nuevo', 'como-nuevo', 'muy-bueno', 'bueno')),
  estimated_value DECIMAL(10,2),
  final_value DECIMAL(10,2),
  wanted_product_id UUID REFERENCES products(id),
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  notes TEXT,
  admin_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------- servicios

CREATE TABLE IF NOT EXISTS repair_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  device TEXT,
  description TEXT,
  price_from DECIMAL(12,2) NOT NULL DEFAULT 0,
  duration TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ---------------------------------------------------------------- blog

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body TEXT,
  cover_url TEXT,
  author TEXT DEFAULT 'Equipo iPhone Purple',
  is_published BOOLEAN DEFAULT FALSE,
  published_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------- ajustes

-- Clave/valor: cotización del dólar, WhatsApp, redes, dirección, horarios.
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------- índices

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_stock ON product_variants(stock) WHERE stock > 0;
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_ins_status ON trade_ins(status);
CREATE INDEX IF NOT EXISTS idx_imports_supplier ON supplier_imports(supplier_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(is_published, published_at DESC);

-- ---------------------------------------------------------------- seguridad
--
-- El sitio público es de solo lectura y anónimo. Todo lo que escribe pasa por
-- Server Actions autenticadas que usan la service role key, así que ninguna
-- policy le abre escritura al rol `anon`.

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Catálogo público" ON products;
CREATE POLICY "Catálogo público" ON products
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Variantes públicas" ON product_variants;
CREATE POLICY "Variantes públicas" ON product_variants
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Imágenes públicas" ON product_images;
CREATE POLICY "Imágenes públicas" ON product_images FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Servicios públicos" ON repair_services;
CREATE POLICY "Servicios públicos" ON repair_services
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Notas publicadas" ON posts;
CREATE POLICY "Notas publicadas" ON posts
  FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Valores de canje públicos" ON trade_in_prices;
CREATE POLICY "Valores de canje públicos" ON trade_in_prices
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Ajustes públicos" ON store_settings;
CREATE POLICY "Ajustes públicos" ON store_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Perfil propio" ON profiles;
CREATE POLICY "Perfil propio" ON profiles FOR SELECT USING (auth.uid() = id);

-- `trade_ins`, `sales`, `suppliers` y `supplier_imports` quedan sin policy de
-- lectura a propósito: solo se acceden con la service role key desde el panel.

-- ---------------------------------------------------------------- funciones

-- Crea el perfil apenas se registra un usuario.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Numera las ventas como IPP-2026-0001.
CREATE OR REPLACE FUNCTION next_sale_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT := TO_CHAR(NOW(), 'YYYY');
  next_val INT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_val
  FROM sales
  WHERE EXTRACT(YEAR FROM sold_at) = EXTRACT(YEAR FROM NOW());
  RETURN 'IPP-' || year_part || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Descuenta stock al registrar una venta, sin dejarlo en negativo.
CREATE OR REPLACE FUNCTION apply_sale_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET stock = GREATEST(0, stock - NEW.quantity)
    WHERE id = NEW.variant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_sale_created
  AFTER INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION apply_sale_stock();
