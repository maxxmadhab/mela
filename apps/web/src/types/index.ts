export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface Artisan {
  id: string;
  name: string;
  village: string | null;
  bio: string | null;
  portrait_url: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_inr: number;
  stock: number;
  category_id: string | null;
  artisan_id: string | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
  created_at?: string;
  category?: Category;
  artisan?: Artisan;
  color_start?: string;
  color_end?: string;
}

export type CraftKind = 'craft' | 'raw_material';

export interface Craft {
  id: string;
  slug: string;
  title: string;
  kind: CraftKind;
  tagline: string | null;
  body: string | null;
  fact: string | null;
  image_url: string | null;
  sort_order: number;
  color_start?: string;
  color_end?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_inr: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_inr: number;
  status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}
