import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:Maxxmad123%40@db.gpvgzhksuewjifkzehew.supabase.co:5432/postgres';

  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    // Read and run migration
    const migrationPath = path.resolve(__dirname, '../../../../supabase/migrations/20261026000000_init_schema.sql');
    console.log(`Applying migration from: ${migrationPath}`);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);
    console.log('Schema migration applied successfully!');

    // Read and run seed
    const seedPath = path.resolve(__dirname, '../../../../supabase/seed.sql');
    console.log(`Applying seed data from: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('Seed data inserted successfully!');

    // Verify row counts
    const resProducts = await client.query('SELECT count(*) FROM public.products');
    const resCategories = await client.query('SELECT count(*) FROM public.categories');
    const resArtisans = await client.query('SELECT count(*) FROM public.artisans');
    const resCrafts = await client.query('SELECT count(*) FROM public.crafts');

    console.log(`Database verification:
- Products: ${resProducts.rows[0].count}
- Categories: ${resCategories.rows[0].count}
- Artisans: ${resArtisans.rows[0].count}
- Crafts: ${resCrafts.rows[0].count}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
