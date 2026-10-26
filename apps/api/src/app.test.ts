import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('MELA API - Phase 1 Scaffold & Health', () => {
  it('GET /api/health returns 200 with ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.name).toBe('mela-api');
  });

  it('sets security headers via helmet', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
  });
});
