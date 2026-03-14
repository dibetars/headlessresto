import { PowerSyncDatabase } from '@powersync/react-native';
import { supabase } from './supabase';

// Table schemas matching sync-rules.yaml buckets
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    location_id TEXT,
    name TEXT,
    description TEXT,
    category TEXT,
    price_cents INTEGER,
    is_available INTEGER,
    image_url TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS stock_items (
    id TEXT PRIMARY KEY,
    location_id TEXT,
    name TEXT,
    category TEXT,
    quantity REAL,
    unit TEXT,
    reorder_threshold REAL,
    last_restocked_at TEXT
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    stock_item_id TEXT,
    quantity_delta REAL,
    movement_type TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    location_id TEXT,
    status TEXT,
    source TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    items TEXT,
    subtotal_cents INTEGER,
    tax_cents INTEGER,
    total_cents INTEGER,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS staff_schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    location_id TEXT,
    scheduled_date TEXT,
    start_time TEXT,
    end_time TEXT,
    role TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_menus (
    id TEXT PRIMARY KEY,
    location_id TEXT,
    date TEXT,
    is_published INTEGER,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    location_id TEXT,
    code TEXT,
    type TEXT,
    value_cents INTEGER,
    value_percent REAL,
    max_uses INTEGER,
    current_uses INTEGER,
    valid_from TEXT,
    valid_until TEXT,
    is_active INTEGER
  );
`;

class SupabaseConnector {
  async fetchCredentials() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    return {
      endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL!,
      token: session.access_token,
    };
  }

  async uploadData(database: PowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
        const { table, opData, id } = op;
        switch (op.op) {
          case 'PUT': {
            const { error } = await supabase.from(table).upsert({ id, ...opData });
            if (error) throw error;
            break;
          }
          case 'PATCH': {
            const { error } = await supabase.from(table).update(opData).eq('id', id);
            if (error) throw error;
            break;
          }
          case 'DELETE': {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            break;
          }
        }
      }
      await transaction.complete();
    } catch (err) {
      console.error('PowerSync upload error', err);
      await transaction.rollback();
    }
  }
}

export const db = new PowerSyncDatabase({
  schema: SCHEMA,
  database: { dbFilename: 'restaurantos.db' },
});

const connector = new SupabaseConnector();

export async function connectPowerSync() {
  await db.connect(connector);
}
