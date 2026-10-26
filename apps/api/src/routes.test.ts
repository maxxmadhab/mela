import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('Phase 4 - Products, Crafts, Categories API Endpoints', () => {
  it('GET /api/products returns 200 and array of active products with relationships', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(8);

    const firstProduct = res.body.data[0];
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('price_inr');
    expect(firstProduct).toHaveProperty('category');
    expect(firstProduct).toHaveProperty('artisan');
  });

  it('GET /api/products?category=Textiles filters by category name', async () => {
    const res = await request(app).get('/api/products?category=Textiles');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((p: any) => {
      expect(p.category.name).toBe('Textiles');
    });
  });

  it('GET /api/products?sort=price_asc sorts by ascending price', async () => {
    const res = await request(app).get('/api/products?sort=price_asc');
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price_inr);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  it('GET /api/products?sort=price_desc sorts by descending price', async () => {
    const res = await request(app).get('/api/products?sort=price_desc');
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price_inr);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  it('GET /api/products?sort=invalid_sort returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).get('/api/products?sort=invalid_sort');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/products/:slug returns product detail by slug', async () => {
    const res = await request(app).get('/api/products/kullu-wool-shawl');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.slug).toBe('kullu-wool-shawl');
    expect(res.body.data.name).toBe('Kullu Wool Shawl');
    expect(res.body.data.category.name).toBe('Textiles');
  });

  it('GET /api/products/unknown-item-slug returns 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/products/unknown-item-slug');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/crafts returns ordered crafts list', async () => {
    const res = await request(app).get('/api/crafts');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(6);
    expect(res.body.data[0].title).toBe('Kullu Wool');
    expect(res.body.data[1].title).toBe('Kinnauri Weaves');
  });

  it('GET /api/categories returns ordered categories list', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(4);
  });
});
