import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../middleware/auth.js';

export const categoriesRouter = Router();

// GET /api/categories -> Ordered categories
categoriesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({ data: categories || [] });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: err?.message || 'Failed to retrieve categories.',
      },
    });
  }
});
