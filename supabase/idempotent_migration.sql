-- Idempotent full migration — safe to run on a partially-migrated database
-- All CREATE TABLE/INDEX/TYPE/TRIGGER/POLICY statements use IF NOT EXISTS or DROP IF EXISTS

-- ============================================================
-- 000: Functions
-- ============================================================

CREATE OR REPLACE FUNCTION set_request_context(
  p_user_id UUID,
  p_org_id UUID,
  p_location_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.user_id', p_user_id::text, true);
  PERFORM set_config('app.org_id', p_org_id::text, true);
  IF p_location_id IS NOT NULL THEN
    PERFORM set_config('app.location_id', p_location_id::text, true);
  ELSE
    PERFORM set_config('app.location_id', '', true);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    auth.uid(),
    NULLIF(current_setting('app.user_id', true), '')::UUID
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.org_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_location_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.location_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stock_items
  SET quantity = quantity + NEW.quantity_change,
      updated_at = now()
  WHERE id = NEW.stock_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= COALESCE(NEW.reorder_threshold, 0) AND
     OLD.quantity > COALESCE(OLD.reorder_threshold, 0) THEN
    PERFORM pg_notify(
      'low_stock',
      json_build_object(
        'stock_item_id', NEW.id,
        'location_id', NEW.location_id,
        'name', NEW.name,
        'quantity', NEW.quantity,
        'threshold', NEW.reorder_threshold
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 001: Organizations & Locations
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_user_id UUID NOT NULL,
  brand_assets JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_user_id);

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  operating_hours JSONB DEFAULT '{}',
  stripe_account_id TEXT,
  uber_fleet_api_key_enc TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_org_id ON locations(org_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(org_id, is_active);

-- ============================================================
-- 002: Users & Memberships
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'owner', 'manager', 'kitchen_staff', 'wait_staff', 'delivery_driver'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id, location_id, role)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON org_memberships(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON org_memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_location ON org_memberships(location_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 003: Licenses
-- ============================================================

DO $$ BEGIN
  CREATE TYPE license_tier AS ENUM ('starter', 'professional', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tier license_tier NOT NULL DEFAULT 'starter',
  max_locations INT NOT NULL DEFAULT 1,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  hosting_expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_id TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_licenses_org ON licenses(org_id, is_active);

-- Extra columns (migration 011)
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS max_staff INT NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS modules_enabled JSONB NOT NULL DEFAULT '["kitchen","orders"]',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 004: RLS helpers + policies
-- ============================================================

CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT DISTINCT org_id
  FROM org_memberships
  WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_location_ids()
RETURNS SETOF UUID AS $$
  SELECT l.id
  FROM locations l
  JOIN org_memberships m ON m.org_id = l.org_id
  WHERE m.user_id = auth.uid()
    AND m.is_active = true
    AND (m.location_id IS NULL OR m.location_id = l.id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "org_member_read" ON organizations;
CREATE POLICY "org_member_read" ON organizations FOR SELECT USING (id IN (SELECT user_org_ids()));

DROP POLICY IF EXISTS "org_owner_update" ON organizations;
CREATE POLICY "org_owner_update" ON organizations FOR UPDATE USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "location_member_read" ON locations;
CREATE POLICY "location_member_read" ON locations FOR SELECT USING (id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "location_owner_insert" ON locations;
CREATE POLICY "location_owner_insert" ON locations
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager') AND is_active = true
    )
  );

DROP POLICY IF EXISTS "location_owner_update" ON locations;
CREATE POLICY "location_owner_update" ON locations
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager') AND is_active = true
    )
  );

DROP POLICY IF EXISTS "membership_read_own" ON org_memberships;
CREATE POLICY "membership_read_own" ON org_memberships FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "membership_read_org" ON org_memberships;
CREATE POLICY "membership_read_org" ON org_memberships
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager') AND is_active = true
    )
  );

DROP POLICY IF EXISTS "membership_owner_all" ON org_memberships;
CREATE POLICY "membership_owner_all" ON org_memberships
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
    )
  );

DROP POLICY IF EXISTS "license_member_read" ON licenses;
CREATE POLICY "license_member_read" ON licenses FOR SELECT USING (org_id IN (SELECT user_org_ids()));

-- ============================================================
-- 005: Kitchen (stock, menu)
-- ============================================================

CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit_cents INT,
  reorder_threshold DECIMAL(10,2),
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity_change DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  allergens TEXT[] DEFAULT '{}',
  prep_time_minutes INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  item_ids UUID[] NOT NULL DEFAULT '{}',
  specials JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  UNIQUE(location_id, menu_date)
);

CREATE INDEX IF NOT EXISTS idx_stock_items_location ON stock_items(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(stock_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_location ON menu_items(location_id, is_available);
CREATE INDEX IF NOT EXISTS idx_daily_menus_location_date ON daily_menus(location_id, menu_date);

ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stock_location_rw" ON stock_items;
CREATE POLICY "stock_location_rw" ON stock_items FOR ALL USING (location_id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "stock_movements_location_rw" ON stock_movements;
CREATE POLICY "stock_movements_location_rw" ON stock_movements FOR ALL USING (location_id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "menu_items_location_rw" ON menu_items;
CREATE POLICY "menu_items_location_rw" ON menu_items FOR ALL USING (location_id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "menu_items_public_read" ON menu_items;
CREATE POLICY "menu_items_public_read" ON menu_items FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "daily_menus_location_rw" ON daily_menus;
CREATE POLICY "daily_menus_location_rw" ON daily_menus FOR ALL USING (location_id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "daily_menus_public_read" ON daily_menus;
CREATE POLICY "daily_menus_public_read" ON daily_menus FOR SELECT USING (is_published = true);

DROP TRIGGER IF EXISTS trg_stock_movement_update ON stock_movements;
CREATE TRIGGER trg_stock_movement_update
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_quantity();

DROP TRIGGER IF EXISTS trg_low_stock_alert ON stock_items;
CREATE TRIGGER trg_low_stock_alert
  AFTER UPDATE OF quantity ON stock_items
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();

-- ============================================================
-- 006: Staff
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role user_role NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE attendance_type AS ENUM ('clock_in', 'clock_out', 'break_start', 'break_end');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type attendance_type NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual',
  lat DECIMAL(9,6),
  lng DECIMAL(9,6)
);

CREATE INDEX IF NOT EXISTS idx_schedules_location_date ON staff_schedules(location_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON staff_schedules(user_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_attendance_location ON attendance_logs(location_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance_logs(user_id, logged_at);

ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedules_location_rw" ON staff_schedules;
CREATE POLICY "schedules_location_rw" ON staff_schedules FOR ALL USING (location_id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "attendance_location_rw" ON attendance_logs;
CREATE POLICY "attendance_location_rw" ON attendance_logs FOR ALL USING (location_id IN (SELECT user_location_ids()));

-- ============================================================
-- 007: Orders & Payments
-- ============================================================

DO $$ BEGIN
  CREATE TYPE order_source AS ENUM ('qr_menu', 'pos', 'delivery_platform');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  source order_source NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal_cents INT NOT NULL,
  tax_cents INT NOT NULL DEFAULT 0,
  tip_cents INT DEFAULT 0,
  discount_cents INT DEFAULT 0,
  total_cents INT NOT NULL,
  coupon_id UUID,
  notes TEXT,
  table_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_account_id TEXT NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_location_status ON orders(location_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_location_created ON orders(location_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_location_rw" ON orders;
CREATE POLICY "orders_location_rw" ON orders FOR ALL USING (location_id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "orders_public_insert" ON orders;
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "payments_location_read" ON payments;
CREATE POLICY "payments_location_read" ON payments
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE location_id IN (SELECT user_location_ids()))
  );

-- ============================================================
-- 008: Deliveries
-- ============================================================

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM (
    'pending', 'driver_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  uber_delivery_id TEXT,
  status delivery_status NOT NULL DEFAULT 'pending',
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  estimated_delivery_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status) WHERE status NOT IN ('delivered', 'cancelled', 'failed');

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deliveries_location_rw" ON deliveries;
CREATE POLICY "deliveries_location_rw" ON deliveries
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE location_id IN (SELECT user_location_ids()))
  );

-- ============================================================
-- 009: Coupons
-- ============================================================

DO $$ BEGIN
  CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type coupon_type NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order_cents INT DEFAULT 0,
  max_uses INT,
  current_uses INT DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(location_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_location ON coupons(location_id, is_active);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_location_rw" ON coupons;
CREATE POLICY "coupons_location_rw" ON coupons FOR ALL USING (location_id IN (SELECT user_location_ids()));

DROP POLICY IF EXISTS "coupons_public_read" ON coupons;
CREATE POLICY "coupons_public_read" ON coupons FOR SELECT USING (is_active = true AND valid_until >= now());

-- FK from orders to coupons (deferred)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_coupon_fk;
ALTER TABLE orders ADD CONSTRAINT orders_coupon_fk
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
  UPDATE coupons SET current_uses = current_uses + 1 WHERE id = coupon_id;
$$ LANGUAGE sql SECURITY DEFINER;
