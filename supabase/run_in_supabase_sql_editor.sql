-- ==============================================================================
-- MELA DATABASE SETUP: SCHEMA, RLS POLICIES & SEED DATA
-- Copy and run this entire file in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

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
DROP POLICY IF EXISTS "Public can view artisans" ON public.artisans;
CREATE POLICY "Public can view artisans" ON public.artisans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage artisans" ON public.artisans;
CREATE POLICY "Admin can manage artisans" ON public.artisans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view crafts" ON public.crafts;
CREATE POLICY "Public can view crafts" ON public.crafts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage crafts" ON public.crafts;
CREATE POLICY "Admin can manage crafts" ON public.crafts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "User can view own profile" ON public.profiles;
CREATE POLICY "User can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "User can update own name" ON public.profiles;
CREATE POLICY "User can update own name" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Admin can manage profiles" ON public.profiles;
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "User can view own orders" ON public.orders;
CREATE POLICY "User can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;
CREATE POLICY "Admin can manage orders" ON public.orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

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

DROP POLICY IF EXISTS "Admin can view contact messages" ON public.contact_messages;
CREATE POLICY "Admin can view contact messages" ON public.contact_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admin can view artisan applications" ON public.artisan_applications;
CREATE POLICY "Admin can view artisan applications" ON public.artisan_applications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Seed Categories
INSERT INTO public.categories (id, name, sort_order) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Textiles', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Woodcraft', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Basketry', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Raw Materials', 4)
ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- 7. Seed Artisans
INSERT INTO public.artisans (id, name, village, bio) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Sunita Devi', 'Naggar', 'Master weaver preserving traditional Kullu handloom patterns on local pit looms.'),
  ('a2222222-2222-2222-2222-222222222222', 'Meena Negi', 'Kalpa', 'Kinnauri artisan known for generational geometric patterns and tribal motif borders.'),
  ('a3333333-3333-3333-3333-333333333333', 'Kamla Thakur', 'Chamba', 'Practitioner of double-satin stitch Chamba Rumal needlework with Pahadi miniature motifs.'),
  ('a4444444-4444-4444-4444-444444444444', 'Ramesh Kumar', 'Kullu', 'Woodcarver shaping sustainably salvaged aromatic Himalayan cedar into heritage boxes.'),
  ('a5555555-5555-5555-5555-555555555555', 'Pushpa Devi', 'Mandi', 'Harvests and weaves wild mountain Ringal bamboo using heirloom splitting techniques.'),
  ('a6666666-6666-6666-6666-666666666666', 'Dolma Lama', 'Spiti', 'High-altitude farmer and weaver transforming wild Himalayan hemp fibre into durable utilitarian cloth.'),
  ('a7777777-7777-7777-7777-777777777777', 'Geeta Sharma', 'Manali', 'Wool spinner crafting regional Himachal caps with traditional velvet and brocade accents.'),
  ('a8888888-8888-8888-8888-888888888888', 'Anil Thakur', 'Kangra', 'Turned walnut wood craftsman creating polished tactile domestic wares from fallen timber.')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Crafts
INSERT INTO public.crafts (slug, title, kind, tagline, body, fact, sort_order) VALUES
  (
    'kullu-wool',
    'Kullu Wool',
    'craft',
    'Wool of the valley',
    'Soft, warm shawls spun from local sheep wool and woven on hand looms in Kullu valley homes. Patterns carry bands of colour traditionally worn by hill communities.',
    'A single shawl can take several days of hand weaving.',
    1
  ),
  (
    'kinnauri-weaves',
    'Kinnauri Weaves',
    'craft',
    'Patterns from the high valleys',
    'Kinnaur’s weavers are known for geometric borders and bright accent bands, woven for caps, stoles and shawls that mark identity and occasion.',
    'Motifs are often passed down within families.',
    2
  ),
  (
    'chamba-rumal',
    'Chamba Rumal',
    'craft',
    'Embroidery as painting',
    'Chamba rumals are embroidered with fine double-satin stitch, often showing scenes from Pahari miniature painting. Women have kept this craft alive for generations.',
    'The design looks identical on both sides of the cloth.',
    3
  ),
  (
    'deodar-wood',
    'Deodar Wood',
    'raw_material',
    'The tree of the gods',
    'Deodar, a Himalayan cedar, is prized for its scent and durability. It has long been used in hill homes, temples and hand-carved objects.',
    'The name comes from a Sanskrit phrase meaning ‘timber of the gods’.',
    4
  ),
  (
    'himalayan-wool-fibres',
    'Himalayan Wool & Fibres',
    'raw_material',
    'From fleece to thread',
    'Sheep wool, goat hair and hemp fibre are cleaned, spun and woven into cloth. Each fibre behaves differently, and artisans choose them by feel.',
    'Hemp has been woven in the hills for centuries.',
    5
  ),
  (
    'natural-dyes',
    'Natural Dyes',
    'raw_material',
    'Colour from the landscape',
    'Bark, roots, leaves and walnut husks give soft earthy shades. Colours vary slightly from batch to batch, which is what makes each piece one of a kind.',
    'No two dye lots are exactly the same.',
    6
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  kind = EXCLUDED.kind,
  tagline = EXCLUDED.tagline,
  body = EXCLUDED.body,
  fact = EXCLUDED.fact,
  sort_order = EXCLUDED.sort_order;

-- 9. Seed Products
INSERT INTO public.products (slug, name, description, price_inr, stock, category_id, artisan_id, featured, active) VALUES
  (
    'kullu-wool-shawl',
    'Kullu Wool Shawl',
    'Soft, warm shawl spun from local sheep wool and hand-woven in Naggar with traditional multi-coloured geometric end-borders.',
    4800,
    5,
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    true,
    true
  ),
  (
    'kinnauri-pattern-stole',
    'Kinnauri Pattern Stole',
    'Intricate geometric woven stole from Kalpa carrying auspicious Pahadi motifs across pure unbleached sheep wool.',
    3600,
    8,
    'c1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    true,
    true
  ),
  (
    'chamba-rumal-panel',
    'Chamba Rumal Panel',
    'Exquisite double-satin needlework panel rendered so the design appears identical on both front and reverse sides of unbleached muslin.',
    5200,
    2,
    'c1111111-1111-1111-1111-111111111111',
    'a3333333-3333-3333-3333-333333333333',
    true,
    true
  ),
  (
    'deodar-carved-box',
    'Deodar Carved Box',
    'Hand-carved storage box with traditional temple latticework motifs, emitting natural Himalayan cedar fragrance.',
    2900,
    4,
    'c2222222-2222-2222-2222-222222222222',
    'a4444444-4444-4444-4444-444444444444',
    false,
    true
  ),
  (
    'ringal-bamboo-basket',
    'Ringal Bamboo Basket',
    'Tightly woven high-altitude wild bamboo storage basket with organic edge reinforcement for utilitarian longevity.',
    1400,
    12,
    'c3333333-3333-3333-3333-333333333333',
    'a5555555-5555-5555-5555-555555555555',
    false,
    true
  ),
  (
    'hemp-fibre-bag',
    'Hemp Fibre Bag',
    'Hand-spun and hand-woven Spiti hemp tote bag. Exceptionally strong, tactile natural fibre built to soften with daily use.',
    2200,
    6,
    'c1111111-1111-1111-1111-111111111111',
    'a6666666-6666-6666-6666-666666666666',
    false,
    true
  ),
  (
    'pahari-wool-cap',
    'Pahari Wool Cap',
    'Authentic round Himachal wool cap tailored from brushed sheep wool with a traditional patterned front flap.',
    900,
    15,
    'c1111111-1111-1111-1111-111111111111',
    'a7777777-7777-7777-7777-777777777777',
    false,
    true
  ),
  (
    'walnut-wood-bowl',
    'Walnut Wood Bowl',
    'Hand-turned solid Himalayan walnut bowl with beeswax and cold-pressed walnut oil finish highlighting natural deep grain.',
    2400,
    3,
    'c2222222-2222-2222-2222-222222222222',
    'a8888888-8888-8888-8888-888888888888',
    false,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  stock = EXCLUDED.stock,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active;
