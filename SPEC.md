# MELA — Product & Technical Spec

> Source of truth for the build. If this file and `reference/mela.html` disagree on **behaviour or data**, follow this file. For **visual feel and motion**, follow the reference.

## 1. Product

**MELA** is a marketplace connecting Pahadi (Himachal Pradesh) artisans directly with buyers. No middlemen: makers list their own pieces, tell their own stories, and are paid directly.

- Tagline: *From the hills, directly to you*
- Audience: buyers who value handmade objects; artisans who want to sell directly
- Tone: calm, premium, minimal, honest. Copy is short and warm.
- Not a clone of any existing site. Original brand and copy.

## 2. Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript, React Router, plain CSS (CSS variables) or CSS Modules |
| Animation | CSS + IntersectionObserver. `framer-motion` allowed for page and scroll effects |
| Backend | Node.js 20 + Express + TypeScript, `zod` validation |
| Database | Supabase (Postgres) with Row Level Security |
| Auth | Supabase Auth: Google OAuth + email/password. Roles via `profiles.role` (`user` / `admin`) |
| Client data | `@supabase/supabase-js` (anon key, read-only public data) |
| Server data | Supabase service-role key, **server only**, never shipped to the browser |
| Cart | Client state (Context/Zustand) persisted to `localStorage`, wrapped in try/catch |
| Hosting | Not decided. Keep everything env-driven |

Monorepo layout:

```
mela/
  apps/web/            # React + Vite
  apps/api/            # Express
  supabase/migrations/ # SQL
  supabase/seed.sql
  reference/mela.html  # visual reference
  SPEC.md  AGENTS.md  .env.example
```

## 3. Design system

### Theme rules (strict)
Keep the palette **warm and earthy**: ivory, charcoal, terracotta and muted olive make handmade objects feel premium. **Product photography provides most of the colour.** UI stays quiet and neutral so images lead.

- **Light theme only. Not dark.** No dark mode, no `prefers-color-scheme` dark styles, no dark full-page backgrounds. (The only exception is the landing screen's dusk-mountain gradient, which is a short intro, and the crafts-free footer stays ivory.)
- Terracotta is an **accent** (links, prices, active states, small tags). Never large flat fills of terracotta.
- Olive is used for small eyebrow labels and secondary accents.

### Tokens
```css
:root{
  --ivory:#F5F1E8;   /* page background */
  --paper:#FAF8F3;   /* cards, panels */
  --charcoal:#282722;/* text, primary buttons */
  --terracotta:#B96D52; /* accent */
  --olive:#74765B;   /* eyebrows, secondary */
  --sandstone:#D8C9B3;
  --line:#DCD6CC;    /* borders */
  --shadow:rgba(40,39,34,.25);
}
```

### Typography (minimal, sans-serif)
- Font: **Inter** (400, 500, 600). No serif fonts.
- Display: 600 weight, letter-spacing `-0.03em`, line-height ~1.02, `clamp(38px, 6vw, 84px)`
- Body: 15px / 1.55, letter-spacing `-0.01em`
- Brand wordmark: 600, letter-spacing `0.12em`
- Eyebrow labels: 11px, uppercase, letter-spacing `0.22em`, olive
- Buttons: pill, uppercase, 11px, letter-spacing `0.16em`

### Motion
- Sections fade up on scroll (IntersectionObserver, ~1s ease).
- Hover on any card/image: zoom the card to ~1.07 with deep soft shadow, zoom the image inside its frame, dim sibling cards. Use `transform` and `opacity` only.
- Respect `prefers-reduced-motion`: disable all of the above.

### Images
All images are **placeholders**; the owner supplies real photos/videos. Build a reusable `<Media>` component (image or video, `object-fit: cover`, lazy loading, aspect-ratio box, striped placeholder fallback with a label). Never hardcode stock URLs.

## 4. Pages & routes

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Landing intro, Our Story, Crafts. One scrollable page |
| `/shop` | Shop | Product grid, filters, quick view |
| `/connect` | Connect | Buyer contact form + artisan application form |
| `/cart` | Cart | Items, quantities, total, checkout preview |
| `/login`, `/signup` | User login / sign up | Google + email/password |
| `/admin/login` | Admin login | Separate entry, same design; email/password only; rejects non-admins |
| `/admin` | Admin catalogue | Admin only: products, categories, crafts CRUD |
| `/account` | User account | Profile and order history |
| `/shop/:slug` | Product detail | Optional; quick view covers the basics |

**No wishlist** anywhere (no heart buttons, no page, no counter). Header nav: Home · Shop · Connect · Cart (with item count badge). Story and Crafts are sections on Home, reachable by `/#story` and `/#crafts`.

### 4.1 Home
1. **Landing intro** (full-screen, first visit only per session): dusk gradient, two SVG mountain layers with mouse parallax, drifting soft clouds, staggered fade-in of eyebrow → "MELA" → one sentence → "Enter mela" button. Button slides the screen up. Skip if user deep-links to another route.
2. **Our Story**: headline "Made in the hills. Sold without middlemen." Short paragraph about direct artisan-to-buyer selling. Three small stats (0 middlemen, 100% maker-led, 1 hill community). CTA to `/shop`. **Four-image mosaic** (artisan portrait, loom, village, raw wool). Hovering one image zooms it and dims the rest.
3. **Crafts & raw materials**: intro heading, then **one full-viewport chapter per craft or material**:
   - Large image (≈78vh) that opens with a `clip-path` reveal on scroll
   - Big chapter number, tag (`Craft` or `Raw material`), title, short eyebrow line, 1 paragraph, 1 highlighted fact
   - Layout alternates image left/right; stacks on mobile
   - Fixed dot navigator on the right highlights the current chapter
   - Initial six chapters: Kullu Wool, Kinnauri Weaves, Chamba Rumal, Deodar Wood, Himalayan Wool & Fibres, Natural Dyes
   - Content comes from the `crafts` table, ordered by `sort_order`
4. **Closing CTA** to Shop.

### 4.2 Shop
- Filters by category (All, Textiles, Woodcraft, Basketry; driven by DB), plus sort (featured, price low→high, high→low).
- Product card: image, name, "by {maker} · {village}", price. Hover: zoom + dim siblings + reveal one-line hint.
- Click opens **quick-view modal**: large image, details, maker, price, Add to cart. Close on Esc, backdrop click, or ×.
- Out-of-stock items are shown but disabled.

### 4.3 Connect
Two cards side by side (stack on mobile):
- **For buyers**: name, email, message → `contact_messages`
- **For artisans**: name & village, phone/WhatsApp, craft type, about → `artisan_applications`
Both validate on client and server, then show a toast. Honeypot field for spam.

### 4.4 Cart
- List with thumbnail, name, maker, quantity stepper (min 1, max = stock), line total, remove.
- Summary: total, "Your payment goes directly to the makers" note, Checkout button.
- **Phase 1 checkout**: collects name, phone, address, creates an `orders` row with status `pending`, shows confirmation. No real payment. Keep a `PaymentProvider` interface so Razorpay can be added later.
- Empty state with link to Shop.
- Server re-prices every order from the DB; **never trust client prices**.

### 4.5 Auth & roles
- **Two roles only:** `user` and `admin`. **The only difference: admins can create, edit, hide and delete catalogue data** (products, categories, crafts, stock, prices, images). Admins otherwise see the same site as users.
- **User login (`/login`, `/signup`)**: Continue with Google, or email + password (with confirm-password on sign up, "forgot password" email flow). Signing up always creates role `user`.
- **Admin login (`/admin/login`)**: separate page and link (not shown in the main nav; footer link only). After sign-in the app checks `profiles.role = 'admin'`; if not, sign out and show "This account is not an admin."
- Admins are created **only** by setting `role='admin'` in the database (a documented SQL snippet in the README). No public path can grant admin.
- **Login pages follow the site design**: ivory background, centred `--paper` card, Inter display heading, pill buttons, olive eyebrow, terracotta links, soft hover lift, subtle fade-in. Google button is an outlined pill. Inline field errors, loading states, no dark styling. Optional: a calm mountain-line illustration or a media slot on the side (placeholder).
- Browsing and cart are open to everyone. **Checkout requires login.** Cart survives login.
- Session handled by `supabase-js` on the web. The API verifies the Supabase JWT on every protected route and reads the role from `profiles` server-side.

### 4.6 Admin catalogue
- Table of products with search, active toggle, stock, price; add/edit form (name, slug, description, price, stock, category, artisan, image upload via Supabase Storage, featured, active); delete with confirm.
- Same for categories, artisans and crafts (title, kind, tagline, body, fact, image, sort order).
- Changes appear on the public site immediately. All writes go through admin-only API routes; the UI hides controls from non-admins but the **server is the real gate**.
- Admin UI uses the same design tokens: calm, minimal, light.

## 5. Data model (Supabase / Postgres)

```sql
create table artisans(
  id uuid primary key default gen_random_uuid(),
  name text not null, village text, bio text, portrait_url text,
  created_at timestamptz default now());

create table categories(
  id uuid primary key default gen_random_uuid(),
  name text unique not null, sort_order int default 0);

create table products(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text,
  price_inr integer not null check (price_inr >= 0),
  stock integer not null default 0 check (stock >= 0),
  category_id uuid references categories(id),
  artisan_id uuid references artisans(id),
  image_url text, featured boolean default false, active boolean default true,
  created_at timestamptz default now());

create table crafts(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null,
  kind text check (kind in ('craft','raw_material')) not null,
  tagline text, body text, fact text, image_url text, sort_order int default 0);

create table profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz default now());
-- trigger: on auth.users insert -> insert into profiles (role 'user')

create table orders(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  customer_name text not null, phone text not null, address text not null,
  total_inr integer not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  created_at timestamptz default now());

create table order_items(
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null check (quantity > 0),
  unit_price_inr integer not null);

create table contact_messages(id uuid primary key default gen_random_uuid(),
  name text, email text, message text, created_at timestamptz default now());

create table artisan_applications(id uuid primary key default gen_random_uuid(),
  name_village text, phone text, craft_type text, about text,
  created_at timestamptz default now());
```

**RLS**
- `products`, `categories`, `artisans`, `crafts`: public `select` (products only where `active`).
- `profiles`: a user can read their own row; **nobody can update `role` from the client**.
- `orders`, `order_items`: a user can read only their own; inserts via the Node API.
- `contact_messages`, `artisan_applications`: **no public access**. Inserts via the Node API with the service-role key.
- Catalogue writes (`products`, `categories`, `artisans`, `crafts`): admin only, enforced by the API and by RLS policies using an `is_admin()` helper.

**Seed**: 6 crafts (see 4.1), 4 categories, 8 sample products and 8 sample artisans. All marked as sample data.

## 6. API (Node/Express)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/products?category=&sort=` | List active products |
| GET | `/api/products/:slug` | Detail |
| GET | `/api/crafts` | Ordered crafts |
| POST | `/api/orders` | **Auth required.** `{customer, items:[{productId, quantity}]}`; validates stock, prices server-side, decrements stock in a transaction |
| POST | `/api/contact` | Buyer message |
| POST | `/api/artisans/apply` | Artisan application |

| GET | `/api/me` | Current user + role |
| GET | `/api/orders/mine` | Own orders |
| POST/PATCH/DELETE | `/api/admin/products`, `/categories`, `/artisans`, `/crafts` | **Admin only** |

Requirements: JWT auth middleware plus `requireAdmin` middleware, `zod` validation on every body, `helmet`, CORS locked to the web origin, rate limiting on POST routes, consistent `{error:{code,message}}` format, no stack traces to clients.

## 7. Environment

```
# apps/web
VITE_SUPABASE_URL=  VITE_SUPABASE_ANON_KEY=  VITE_API_URL=
# apps/api
SUPABASE_URL=  SUPABASE_SERVICE_ROLE_KEY=  WEB_ORIGIN=  PORT=
```
Google login is configured in the Supabase dashboard (Auth → Providers → Google) with a Google Cloud OAuth client ID and secret, and the redirect URLs for local and production.

**Secrets rule:** the agent must **stop and ask the owner** for any value it needs (Supabase URL, anon key, service-role key, Google client ID/secret, redirect URLs, Storage bucket name). Never invent, guess or hardcode them, and never commit them. Provide `.env.example`. Never commit secrets.

## 8. Quality bar

- Responsive from 360px to 1920px; mobile nav stays usable.
- Accessible: semantic landmarks, visible focus rings, alt text on all media, modal traps focus, colour contrast ≥ WCAG AA.
- Lighthouse performance ≥ 90 on Home and Shop (lazy-load media, no layout shift).
- Loading, empty and error states for every data fetch.
- Typed end-to-end; ESLint + Prettier; no `any` without a comment.
- Copy is sample content. Show a small footer note: "Sample content — replace with verified maker details."

## 9. Acceptance criteria

- [ ] Routes `/`, `/shop`, `/connect`, `/cart` work with browser back/forward
- [ ] Landing intro plays once per session and can be skipped by deep link
- [ ] Story shows four image slots with hover zoom + dim
- [ ] Crafts renders six full-viewport chapters from the database with reveal animation and dot navigator
- [ ] Shop filters, sorts, hover zoom and quick view work
- [ ] Cart persists across refresh; quantities respect stock
- [ ] Order creation re-prices server-side and decrements stock atomically
- [ ] Google login and email/password login work for users; sign-up creates role `user`
- [ ] `/admin/login` rejects non-admins; admins can add, edit, hide and delete products, categories, artisans and crafts, and changes show on the public site
- [ ] A normal user calling any admin API route gets 403
- [ ] Login/signup/admin pages match the site design
- [ ] Both Connect forms write to Supabase through the API
- [ ] No wishlist anywhere; no dark mode; palette matches tokens
- [ ] `npm run dev` starts web + api; README explains Supabase setup, migrations, seed

## 10. Delivery phases & testing

Build in stages. **After every phase: run type-check, lint, build and the phase's tests, show the results, and get the owner's go-ahead before the next phase.**

| # | Phase | Test before moving on |
|---|---|---|
| 1 | Monorepo scaffold, tokens, layout shell, routing | App boots; routes render; build passes |
| 2 | Supabase schema, RLS, seed, `profiles` + trigger | Migration runs clean; anon can read products, cannot read orders |
| 3 | Auth: user login (Google + password), admin login, role guard | Sign up, sign in, sign out; user blocked from `/admin`; non-admin rejected at `/admin/login` |
| 4 | API: products, crafts, `/me`, middleware | Unit/integration tests; 401 without token, 403 for non-admin |
| 5 | Home: landing, story, crafts chapters | Visual check against reference; scroll and hover behave; reduced-motion works |
| 6 | Shop + quick view | Filter, sort, hover, modal, keyboard close |
| 7 | Cart + checkout + orders | Stock limits, server re-pricing, order saved, cart survives login |
| 8 | Admin catalogue CRUD + image upload | Create/edit/delete reflects publicly; blocked for users |
| 9 | Connect forms | Rows saved; validation and spam guard |
| 10 | Accessibility, responsive, performance, README | Lighthouse ≥ 90; keyboard-only pass; fresh-clone setup works |

## 11. Non-goals (for now)

Real payments (keep `PaymentProvider` interface for Razorpay later), artisan self-service dashboard, reviews, multi-language, wishlist (never).
