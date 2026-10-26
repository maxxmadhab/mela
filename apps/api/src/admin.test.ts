import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from './app.js';
import { supabaseAdmin } from './middleware/auth.js';

describe('Phase 8 - Admin Catalogue CRUD & Protection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/admin/products returns 401 UNAUTHORIZED when no token is supplied', async () => {
    const res = await request(app).get('/api/admin/products');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/admin/products returns 403 FORBIDDEN when user has user role', async () => {
    const mockUser = { id: '00000000-0000-0000-0000-000000000002', email: 'regular@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockUser as any },
      error: null,
    });
    vi.spyOn(supabaseAdmin, 'from').mockImplementationOnce(() => {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { id: mockUser.id, role: 'user', full_name: 'Regular Buyer' },
            }),
          }),
        }),
      } as any;
    });

    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', 'Bearer user-token');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/admin/products returns 200 and all products when user has admin role', async () => {
    const mockAdmin = { id: '00000000-0000-0000-0000-000000000003', email: 'admin@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockAdmin as any },
      error: null,
    });

    vi.spyOn(supabaseAdmin, 'from').mockImplementation(((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: mockAdmin.id, role: 'admin', full_name: 'Catalogue Admin' },
              }),
            }),
          }),
        };
      }
      if (table === 'products') {
        return {
          select: () => ({
            order: async () => ({
              data: [{ id: 'prod-1', name: 'Kinnauri Stole', price_inr: 2400, stock: 5 }],
              error: null,
            }),
          }),
        };
      }
      return {};
    }) as any);

    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', 'Bearer admin-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].name).toBe('Kinnauri Stole');
  });

  it('GET /api/admin/categories returns 200 for admin', async () => {
    const mockAdmin = { id: '00000000-0000-0000-0000-000000000003', email: 'admin@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockAdmin as any },
      error: null,
    });

    vi.spyOn(supabaseAdmin, 'from').mockImplementation(((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: mockAdmin.id, role: 'admin', full_name: 'Catalogue Admin' },
              }),
            }),
          }),
        };
      }
      if (table === 'categories') {
        return {
          select: () => ({
            order: async () => ({
              data: [{ id: 'cat-1', name: 'Textiles', sort_order: 1 }],
              error: null,
            }),
          }),
        };
      }
      return {};
    }) as any);

    const res = await request(app)
      .get('/api/admin/categories')
      .set('Authorization', 'Bearer admin-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].name).toBe('Textiles');
  });

  it('POST /api/admin/categories returns 400 VALIDATION_ERROR on empty name', async () => {
    const mockAdmin = { id: '00000000-0000-0000-0000-000000000003', email: 'admin@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockAdmin as any },
      error: null,
    });
    vi.spyOn(supabaseAdmin, 'from').mockImplementationOnce(() => {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { id: mockAdmin.id, role: 'admin', full_name: 'Catalogue Admin' },
            }),
          }),
        }),
      } as any;
    });

    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/admin/upload returns 400 when no file is uploaded', async () => {
    const mockAdmin = { id: '00000000-0000-0000-0000-000000000003', email: 'admin@mela.craft' };
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: mockAdmin as any },
      error: null,
    });
    vi.spyOn(supabaseAdmin, 'from').mockImplementationOnce(() => {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { id: mockAdmin.id, role: 'admin', full_name: 'Catalogue Admin' },
            }),
          }),
        }),
      } as any;
    });

    const res = await request(app)
      .post('/api/admin/upload')
      .set('Authorization', 'Bearer admin-token');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_FILE');
  });
});
