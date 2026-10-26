import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../middleware/auth.js';

export const craftsRouter = Router();

// GET /api/crafts -> Ordered crafts
craftsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { data: crafts, error } = await supabaseAdmin
      .from('crafts')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({ data: crafts || [] });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: err?.message || 'Failed to retrieve crafts.',
      },
    });
  }
});
