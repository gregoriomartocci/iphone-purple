-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address JSONB,
  preferences JSONB,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES categories(id),
  sku TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  specs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price_ars DECIMAL(12,2) NOT NULL,
  price_usd DECIMAL(10,2),
  compare_price_ars DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 3,
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES profiles(id),
  order_id UUID,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')),
  value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  user_id UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  guest_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
  payment_method TEXT CHECK (payment_method IN ('mercadopago','stripe','cash')),
  payment_id TEXT,
  currency TEXT DEFAULT 'ARS',
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  shipping DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  coupon_id UUID REFERENCES coupons(id),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  notes TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL
);

-- Order events (timeline)
CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','processed')),
  payment_refund_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade-ins (Plan Canje)
CREATE TABLE IF NOT EXISTS trade_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_storage TEXT,
  device_condition TEXT NOT NULL CHECK (device_condition IN ('excelente','bueno','regular','roto')),
  has_accessories BOOLEAN DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  estimated_value_min DECIMAL(10,2),
  estimated_value_max DECIMAL(10,2),
  final_value DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','evaluating','offered','accepted','rejected')),
  notes TEXT,
  admin_notes TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link TEXT,
  position TEXT DEFAULT 'hero' CHECK (position IN ('hero','strip','section','popup')),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_token TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Store settings
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlists USING (auth.uid() = user_id);
CREATE POLICY "Users can view approved reviews" ON reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can insert own review" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own trade-ins" ON trade_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can insert trade-ins" ON trade_ins FOR INSERT WITH CHECK (TRUE);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num TEXT;
  next_val INT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO next_val FROM orders WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  seq_num := LPAD(next_val::TEXT, 4, '0');
  RETURN 'IPP-' || year_part || '-' || seq_num;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
