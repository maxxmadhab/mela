import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'mela-api', timestamp: new Date().toISOString() });
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
