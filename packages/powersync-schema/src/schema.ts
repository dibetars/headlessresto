import { column, Schema, Table } from "@powersync/web";

/**
 * PowerSync local schema.
 *
 * These tables exist in the on-device SQLite database.
 * PowerSync keeps them in sync with the Supabase backend
 * based on the sync rules defined in sync-rules.yaml.
 *
 * The app reads/writes to these local tables — it never
 * queries Supabase directly for operational data. This is
 * what makes the app work offline.
 */

const menuItems = new Table({
  location_id: column.text,
  name: column.text,
  description: column.text,
  price_cents: column.integer,
  category: column.text,
  image_url: column.text,
  is_available: column.integer, // SQLite boolean (0/1)
  allergens: column.text,       // JSON string
  prep_time_minutes: column.integer,
  sort_order: column.integer,
  created_at: column.text,
});

const stockItems = new Table({
  location_id: column.text,
  name: column.text,
  quantity: column.real,
  unit: column.text,
  cost_per_unit_cents: column.integer,
  reorder_threshold: column.real,
  category: column.text,
  updated_at: column.text,
});

const stockMovements = new Table({
  stock_item_id: column.text,
  location_id: column.text,
  quantity_change: column.real,
  reason: column.text,
  created_at: column.text,
});

const orders = new Table({
  location_id: column.text,
  source: column.text,
  status: column.text,
  customer_name: column.text,
  customer_phone: column.text,
  items: column.text,           // JSON string
  subtotal_cents: column.integer,
  tax_cents: column.integer,
  tip_cents: column.integer,
  discount_cents: column.integer,
  total_cents: column.integer,
  coupon_id: column.text,
  notes: column.text,
  table_number: column.text,
  created_at: column.text,
  updated_at: column.text,
});

const dailyMenus = new Table({
  location_id: column.text,
  menu_date: column.text,
  item_ids: column.text,        // JSON string (UUID array)
  specials: column.text,        // JSON string
  is_published: column.integer,
  published_at: column.text,
});

const staffSchedules = new Table({
  user_id: column.text,
  location_id: column.text,
  shift_date: column.text,
  start_time: column.text,
  end_time: column.text,
  role: column.text,
  notes: column.text,
  created_at: column.text,
});

const attendanceLogs = new Table({
  user_id: column.text,
  location_id: column.text,
  type: column.text,
  logged_at: column.text,
  source: column.text,
  lat: column.real,
  lng: column.real,
});

const coupons = new Table({
  location_id: column.text,
  code: column.text,
  type: column.text,
  value: column.real,
  min_order_cents: column.integer,
  max_uses: column.integer,
  current_uses: column.integer,
  valid_from: column.text,
  valid_until: column.text,
  is_active: column.integer,
});

const locations = new Table({
  org_id: column.text,
  name: column.text,
  address: column.text,
  city: column.text,
  state: column.text,
  zip: column.text,
  timezone: column.text,
  operating_hours: column.text, // JSON string
  is_active: column.integer,
});

const orgMemberships = new Table({
  user_id: column.text,
  org_id: column.text,
  location_id: column.text,
  role: column.text,
  is_active: column.integer,
});

export const AppSchema = new Schema({
  menu_items: menuItems,
  stock_items: stockItems,
  stock_movements: stockMovements,
  orders: orders,
  daily_menus: dailyMenus,
  staff_schedules: staffSchedules,
  attendance_logs: attendanceLogs,
  coupons: coupons,
  locations: locations,
  org_memberships: orgMemberships,
});
