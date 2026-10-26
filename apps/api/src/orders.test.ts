import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from './app.js';
import { supabaseAdmin } from './middleware/auth.js';

describe('Phase 7 - Orders API Endpoints', () => {
  it('POST /api/orders returns 401 UNAUTHORIZED when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer_name: 'Priya Sharma',
        phone: '9876543210',
        address: 'Village Naggar, Kullu, HP 175130',
        items: [{ product_id: '00000000-0000-0000-0000-000000000001', quantity: 1 }],
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/orders/mine returns 401 UNAUTHORIZED when unauthenticated', async () => {
    const res = await request(app).get('/api/orders/mine');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/orders returns 400 VALIDATION_ERROR when payload is invalid', async () => {
    // Mock valid user session
    const mockUser = { id: '00000000-0000-0000-0000-000000000001', email: 'buyer@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockUser as any },
      error: null,
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        customer_name: '', // Invalid: min 2
        phone: '123', // Invalid: min 8
        address: '', // Invalid: min 10
        items: [], // Invalid: min 1
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/orders rejects unavailable product with 400 PRODUCT_UNAVAILABLE', async () => {
    const mockUser = { id: '00000000-0000-0000-0000-000000000001', email: 'buyer@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockUser as any },
      error: null,
    });

    const nonExistentUuid = 'a0000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        customer_name: 'Priya Sharma',
        phone: '9876543210',
        address: 'Near Old Castle, Naggar, Kullu, Himachal Pradesh 175130',
        items: [{ product_id: nonExistentUuid, quantity: 1 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('PRODUCT_UNAVAILABLE');
  });

  it('POST /api/orders enforces server-side stock limit with 400 INSUFFICIENT_STOCK', async () => {
    const mockUser = { id: '00000000-0000-0000-0000-000000000001', email: 'buyer@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockUser as any },
      error: null,
    });

    // Fetch an existing product from live catalogue to get its real ID and stock
    const prodRes = await request(app).get('/api/products/kullu-wool-shawl');
    expect(prodRes.status).toBe(200);
    const product = prodRes.body.data;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        customer_name: 'Priya Sharma',
        phone: '9876543210',
        address: 'Near Old Castle, Naggar, Kullu, Himachal Pradesh 175130',
        items: [{ product_id: product.id, quantity: product.stock + 9999 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
    expect(res.body.error.message).toContain('Insufficient stock');
  });

  it('GET /api/orders/mine returns 200 and list of orders for authenticated user', async () => {
    const mockUser = { id: '00000000-0000-0000-0000-000000000001', email: 'buyer@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockUser as any },
      error: null,
    });

    const res = await request(app)
      .get('/api/orders/mine')
      .set('Authorization', 'Bearer valid-test-token');

    expect(res.status).toBe(200);
    expect(res.body.orders).toBeDefined();
    expect(Array.isArray(res.body.orders)).toBe(true);
  });
});
