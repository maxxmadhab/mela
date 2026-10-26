-- Migration: 20261026000000_init_schema.sql
-- MELA - Schema, Tables, Trigger and Row Level Security

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS public.artisans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  village text,
  bio text,
  portrait_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  sort_order int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_inr integer NOT NULL CHECK (price_inr >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  artisan_id uuid REFERENCES public.artisans(id) ON DELETE SET NULL,
  image_url text,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('craft', 'raw_material')),
  tagline text,
  body text,
  fact text,
  image_url text,
  sort_order int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  total_inr integer NOT NULL CHECK (total_inr >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price_inr integer NOT NULL CHECK (unit_price_inr >= 0)
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.artisan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_village text,
  phone text,
  craft_type text,
  about text,
  created_at timestamptz DEFAULT now()
);

-- 2. Auth User Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_applications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Artisans: Public can view, admin can manage
DROP POLICY IF EXISTS "Public can view artisans" ON public.artisans;
CREATE POLICY "Public can view artisans" ON public.artisans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage artisans" ON public.artisans;
CREATE POLICY "Admin can manage artisans" ON public.artisans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Categories: Public can view, admin can manage
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Products: Public can view active products, admin can manage all
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Crafts: Public can view crafts, admin can manage
DROP POLICY IF EXISTS "Public can view crafts" ON public.crafts;
CREATE POLICY "Public can view crafts" ON public.crafts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage crafts" ON public.crafts;
CREATE POLICY "Admin can manage crafts" ON public.crafts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profiles: User can view own profile; admin can view all; user cannot modify role
DROP POLICY IF EXISTS "User can view own profile" ON public.profiles;
CREATE POLICY "User can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "User can update own name" ON public.profiles;
CREATE POLICY "User can update own name" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Admin can manage profiles" ON public.profiles;
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders: User can view own orders, admin can view/manage all
DROP POLICY IF EXISTS "User can view own orders" ON public.orders;
CREATE POLICY "User can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;
CREATE POLICY "Admin can manage orders" ON public.orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Order Items: User can view items of own orders
DROP POLICY IF EXISTS "User can view own order items" ON public.order_items;
CREATE POLICY "User can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR public.is_admin())
  )
);
DROP POLICY IF EXISTS "Admin can manage order items" ON public.order_items;
CREATE POLICY "Admin can manage order items" ON public.order_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Contact Messages & Artisan Applications: No public read/write; admin only (API uses service-role key)
DROP POLICY IF EXISTS "Admin can view contact messages" ON public.contact_messages;
CREATE POLICY "Admin can view contact messages" ON public.contact_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admin can view artisan applications" ON public.artisan_applications;
CREATE POLICY "Admin can view artisan applications" ON public.artisan_applications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
