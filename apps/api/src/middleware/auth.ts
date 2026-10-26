import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';
import { config } from '../config.js';

// Server-only Supabase client with service-role key
export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface AuthenticatedRequest extends Request {
  user?: User;
  profile?: {
    id: string;
    full_name: string | null;
    role: 'user' | 'admin';
    created_at: string;
  };
}

export async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return next();
    }

    req.user = user;

    // Fetch user profile from database to determine role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      req.profile = profile;
    }
  } catch (err) {
    // Silent fail in optional auth step, handled by requireAuth
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource.',
      },
    });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
    });
  }

  if (req.profile?.role !== 'admin') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Admin privileges required to perform this action.',
      },
    });
  }

  next();
}
