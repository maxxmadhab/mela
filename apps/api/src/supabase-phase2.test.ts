import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gpvgzhksuewjifkzehew.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vKcBHMwQSvSQT2teOvlCgQ_BqyzKCKQ';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_o4jYUCKL-R4nwyMqZBJ8gA_L8WO_JD0';

describe('Phase 2 Acceptance: Supabase Schema, Seed & RLS Policies', () => {
  const anonClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  it('allows anonymous read of active products', async () => {
    const { data, error } = await anonClient.from('products').select('*').eq('active', true);
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data!.length).toBeGreaterThanOrEqual(1);
  });

  it('allows anonymous read of crafts ordered by sort_order', async () => {
    const { data, error } = await anonClient.from('crafts').select('*').order('sort_order', { ascending: true });
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBe(6);
  });

  it('prevents anonymous users from reading orders (RLS enforcement)', async () => {
    const { data, error } = await anonClient.from('orders').select('*');
    // In Supabase RLS, selecting from an empty/restricted table either returns empty array [] or error
    expect(data).toEqual([]);
  });

  it('prevents anonymous users from reading contact messages (RLS enforcement)', async () => {
    const { data } = await anonClient.from('contact_messages').select('*');
    expect(data).toEqual([]);
  });

  it('service role can read catalogue data and admin tables', async () => {
    const { data, error } = await adminClient.from('products').select('*');
    expect(error).toBeNull();
    expect(data!.length).toBe(8);
  });
});
