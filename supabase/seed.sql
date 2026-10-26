-- Seed: Initial categories, crafts, artisans, and sample products
-- All content is sample data for MELA

-- 1. Categories
INSERT INTO public.categories (id, name, sort_order) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Textiles', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Woodcraft', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Basketry', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Raw Materials', 4)
ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- 2. Artisans
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

-- 3. Crafts & Raw Materials
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

-- 4. Sample Products
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
