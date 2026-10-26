import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';

export const productsRouter = Router();

const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['featured', 'price_asc', 'price_desc', 'newest']).optional(),
});

// GET /api/products?category=&sort=
productsRouter.get(
  '/',
  validateQuery(listProductsQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const { category, sort = 'featured' } = req.query as {
        category?: string;
        sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
      };

      let query = supabaseAdmin
        .from('products')
        .select(`
          id,
          slug,
          name,
          description,
          price_inr,
          stock,
          image_url,
          featured,
          active,
          created_at,
          category:categories (
            id,
            name,
            sort_order
          ),
          artisan:artisans (
            id,
            name,
            village,
            bio,
            portrait_url
          )
        `)
        .eq('active', true);

      // Category filter (support category name like "Textiles" or UUID)
      if (category && category !== 'All') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
        if (isUuid) {
          query = query.eq('category_id', category);
        } else {
          // First lookup category id by name
          const { data: catData } = await supabaseAdmin
            .from('categories')
            .select('id')
            .ilike('name', category)
            .maybeSingle();

          if (catData) {
            query = query.eq('category_id', catData.id);
          } else {
            return res.json({ data: [] });
          }
        }
      }

      // Sort
      if (sort === 'price_asc') {
        query = query.order('price_inr', { ascending: true });
      } else if (sort === 'price_desc') {
        query = query.order('price_inr', { ascending: false });
      } else if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        // default: featured first, then created_at
        query = query
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      res.json({ data: data || [] });
    } catch (err: any) {
      res.status(500).json({
        error: {
          code: 'DATABASE_ERROR',
          message: err?.message || 'Failed to retrieve products.',
        },
      });
    }
  }
);

// GET /api/products/:slug
productsRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        slug,
        name,
        description,
        price_inr,
        stock,
        image_url,
        featured,
        active,
        created_at,
        category:categories (
          id,
          name,
          sort_order
        ),
        artisan:artisans (
          id,
          name,
          village,
          bio,
          portrait_url
        )
      `)
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!product) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Product with slug '${slug}' not found.`,
        },
      });
    }

    res.json({ data: product });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: err?.message || 'Failed to retrieve product details.',
      },
    });
  }
});
