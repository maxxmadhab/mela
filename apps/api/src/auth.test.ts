import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('Phase 3 - API Authentication and Role Guard Middleware', () => {
  it('GET /api/me returns 401 UNAUTHORIZED when no token is provided', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/admin/check returns 401 UNAUTHORIZED when no token is provided', async () => {
    const res = await request(app).get('/api/admin/check');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/admin/check returns 401 when invalid token format is provided', async () => {
    const res = await request(app)
      .get('/api/admin/check')
      .set('Authorization', 'Bearer invalid-token-123');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
