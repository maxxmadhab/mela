import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';
import { authenticate, requireAuth, requireAdmin, AuthenticatedRequest } from './middleware/auth.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Attach optional auth to all requests
app.use(authenticate as express.RequestHandler);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'mela-api', timestamp: new Date().toISOString() });
});

// GET /api/me -> Current user + role
app.get('/api/me', requireAuth as express.RequestHandler, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
    },
    profile: req.profile || {
      id: req.user!.id,
      full_name: null,
      role: 'user',
    },
  });
});

// Admin-only test endpoint
app.get('/api/admin/check', requireAdmin as express.RequestHandler, (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Admin verified' });
});

// Central error handler matching SPEC.md: { error: { code, message } }
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred.';

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
});

export default app;
