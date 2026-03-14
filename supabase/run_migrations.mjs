/**
 * RestaurantOS — Migration Runner
 * Usage:  node supabase/run_migrations.mjs <DB_PASSWORD>
 *
 * Find your DB password in:
 *   Supabase Dashboard → Settings → Database → "Database password"
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const PROJECT_REF = 'rwvvsutsuutyvmapukvm';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

const MIGRATIONS = [
  '000_functions.sql',
  '001_organizations.sql',
  '002_locations.sql',
  '003_users_memberships.sql',
  '004_licenses.sql',
  '005_kitchen.sql',
  '006_staff.sql',
  '007_orders_payments.sql',
  '008_deliveries.sql',
  '009_coupons.sql',
  '010_rls_policies.sql',
  '011_licenses_extra_cols.sql',
];

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  console.log('🚀 RestaurantOS — Running migrations via Management API\n');

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('❌ SUPABASE_ACCESS_TOKEN not set.');
    console.error('   Get one at: https://supabase.com/dashboard/account/tokens');
    console.error('   Then run: SUPABASE_ACCESS_TOKEN=your_token node supabase/run_migrations.mjs\n');
    process.exit(1);
  }

  for (const file of MIGRATIONS) {
    const sql = readFileSync(join(__dirname, 'migrations', file), 'utf8');
    process.stdout.write(`  Running ${file}... `);

    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`\n❌ Failed: ${body}`);
      process.exit(1);
    }

    console.log('✅');
  }

  console.log('\n✅ All migrations applied successfully!');
  console.log('\n📦 Optionally seed demo data:');
  console.log('   Run the seed.sql file in the Supabase SQL Editor.');
}

runMigrations().catch(console.error);
