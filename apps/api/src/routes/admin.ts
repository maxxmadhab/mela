import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { supabaseAdmin, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const adminRouter = Router();

// Protect all admin routes with requireAdmin
adminRouter.use(requireAdmin as any);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed.'));
    }
  },
});

// ==================== IMAGE UPLOAD ====================
adminRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: { code: 'NO_FILE', message: 'No image file uploaded.' },
      });
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `catalogue/${filename}`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('catalogue')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadErr) {
      return res.status(500).json({
        error: { code: 'UPLOAD_FAILED', message: uploadErr.message },
      });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('catalogue')
      .getPublicUrl(filePath);

    return res.status(201).json({
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: { code: 'UPLOAD_ERROR', message: err?.message || 'Failed to upload image.' },
    });
  }
});

// ==================== PRODUCTS CRUD ====================
const productSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  slug: z.string().trim().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional().nullable(),
  price_inr: z.number().int().nonnegative('Price must be a positive integer'),
  stock: z.number().int().nonnegative('Stock must be a positive integer'),
  category_id: z.string().uuid().optional().nullable(),
  artisan_id: z.string().uuid().optional().nullable(),
  image_url: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

adminRouter.get('/products', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      artisan:artisans(id, name, village)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: { code: 'DB_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.post('/products', validateBody(productSchema), async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'INSERT_ERROR', message: error.message } });
  }
  return res.status(201).json({ data });
});

adminRouter.patch('/products/:id', validateBody(productSchema.partial()), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'UPDATE_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.delete('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: { code: 'DELETE_ERROR', message: error.message } });
  }
  return res.json({ status: 'ok', message: 'Product deleted' });
});

// ==================== CATEGORIES CRUD ====================
const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  sort_order: z.number().int().optional().default(0),
});

adminRouter.get('/categories', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return res.status(500).json({ error: { code: 'DB_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.post('/categories', validateBody(categorySchema), async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'INSERT_ERROR', message: error.message } });
  }
  return res.status(201).json({ data });
});

adminRouter.patch('/categories/:id', validateBody(categorySchema.partial()), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'UPDATE_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.delete('/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: { code: 'DELETE_ERROR', message: error.message } });
  }
  return res.json({ status: 'ok', message: 'Category deleted' });
});

// ==================== ARTISANS CRUD ====================
const artisanSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  village: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  portrait_url: z.string().optional().nullable(),
});

adminRouter.get('/artisans', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('artisans')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(500).json({ error: { code: 'DB_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.post('/artisans', validateBody(artisanSchema), async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('artisans')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'INSERT_ERROR', message: error.message } });
  }
  return res.status(201).json({ data });
});

adminRouter.patch('/artisans/:id', validateBody(artisanSchema.partial()), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('artisans')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'UPDATE_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.delete('/artisans/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from('artisans')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: { code: 'DELETE_ERROR', message: error.message } });
  }
  return res.json({ status: 'ok', message: 'Artisan deleted' });
});

// ==================== CRAFTS CRUD ====================
const craftSchema = z.object({
  slug: z.string().trim().min(2),
  title: z.string().trim().min(2),
  kind: z.enum(['craft', 'raw_material']),
  tagline: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  fact: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  sort_order: z.number().int().optional().default(0),
});

adminRouter.get('/crafts', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('crafts')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return res.status(500).json({ error: { code: 'DB_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.post('/crafts', validateBody(craftSchema), async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('crafts')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'INSERT_ERROR', message: error.message } });
  }
  return res.status(201).json({ data });
});

adminRouter.patch('/crafts/:id', validateBody(craftSchema.partial()), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('crafts')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'UPDATE_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.delete('/crafts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from('crafts')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: { code: 'DELETE_ERROR', message: error.message } });
  }
  return res.json({ status: 'ok', message: 'Craft deleted' });
});

// ==================== ADMIN ORDERS VIEW & STATUS UPDATE ====================
adminRouter.get('/orders', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items (
        id,
        quantity,
        unit_price_inr,
        product:products(name, slug)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: { code: 'DB_ERROR', message: error.message } });
  }
  return res.json({ data });
});

adminRouter.patch('/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending', 'paid', 'shipped', 'cancelled'].includes(status)) {
    return res.status(400).json({
      error: { code: 'INVALID_STATUS', message: 'Status must be pending, paid, shipped, or cancelled.' },
    });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { code: 'UPDATE_ERROR', message: error.message } });
  }
  return res.json({ data });
});
