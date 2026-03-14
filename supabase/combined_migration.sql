-- This function is called by the NestJS TenantMiddleware on every request.
-- It sets PostgreSQL session variables that RLS policies reference.

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

-- Helper functions used by RLS policies

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

-- Stock movement trigger function: auto-update stock_items.quantity
-- NOTE: The actual CREATE TRIGGER statements are in 005_kitchen.sql
-- because the tables (stock_movements, stock_items) are created there.

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

-- Low stock notification function
-- NOTE: Trigger registered in 005_kitchen.sql

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
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_user_id UUID NOT NULL,
  brand_assets JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_owner ON organizations(owner_user_id);
CREATE TABLE locations (
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

CREATE INDEX idx_locations_org_id ON locations(org_id);
CREATE INDEX idx_locations_active ON locations(org_id, is_active);
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE user_role AS ENUM (
  'owner',
  'manager',
  'kitchen_staff',
  'wait_staff',
  'delivery_driver'
);

CREATE TABLE org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id, location_id, role)
);

CREATE INDEX idx_memberships_user ON org_memberships(user_id, is_active);
CREATE INDEX idx_memberships_org ON org_memberships(org_id);
CREATE INDEX idx_memberships_location ON org_memberships(location_id);

-- Auto-create user profile when a new auth user signs up
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TYPE license_tier AS ENUM ('starter', 'professional', 'enterprise');

CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tier license_tier NOT NULL DEFAULT 'starter',
  max_locations INT NOT NULL DEFAULT 1,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  hosting_expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_id TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_licenses_org ON licenses(org_id, is_active);
CREATE TABLE stock_items (
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

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity_change DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE menu_items (
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

CREATE TABLE daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  item_ids UUID[] NOT NULL DEFAULT '{}',
  specials JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  UNIQUE(location_id, menu_date)
);

CREATE INDEX idx_stock_items_location ON stock_items(location_id);
CREATE INDEX idx_stock_movements_item ON stock_movements(stock_item_id);
CREATE INDEX idx_menu_items_location ON menu_items(location_id, is_available);
CREATE INDEX idx_daily_menus_location_date ON daily_menus(location_id, menu_date);

-- RLS
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_location_rw" ON stock_items
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

CREATE POLICY "stock_movements_location_rw" ON stock_movements
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

CREATE POLICY "menu_items_location_rw" ON menu_items
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

-- Public read for QR menu
CREATE POLICY "menu_items_public_read" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "daily_menus_location_rw" ON daily_menus
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

CREATE POLICY "daily_menus_public_read" ON daily_menus
  FOR SELECT USING (is_published = true);

-- Triggers (functions defined in 000_functions.sql)
CREATE TRIGGER trg_stock_movement_update
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_quantity();

CREATE TRIGGER trg_low_stock_alert
  AFTER UPDATE OF quantity ON stock_items
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();
CREATE TABLE staff_schedules (
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

CREATE TYPE attendance_type AS ENUM ('clock_in', 'clock_out', 'break_start', 'break_end');

CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type attendance_type NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual',
  lat DECIMAL(9,6),
  lng DECIMAL(9,6)
);

CREATE INDEX idx_schedules_location_date ON staff_schedules(location_id, shift_date);
CREATE INDEX idx_schedules_user ON staff_schedules(user_id, shift_date);
CREATE INDEX idx_attendance_location ON attendance_logs(location_id, logged_at);
CREATE INDEX idx_attendance_user ON attendance_logs(user_id, logged_at);

ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_location_rw" ON staff_schedules
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

CREATE POLICY "attendance_location_rw" ON attendance_logs
  FOR ALL USING (location_id IN (SELECT user_location_ids()));
CREATE TYPE order_source AS ENUM ('qr_menu', 'pos', 'delivery_platform');
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready',
  'out_for_delivery', 'delivered', 'completed', 'cancelled'
);

CREATE TABLE orders (
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

CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE payments (
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

CREATE INDEX idx_orders_location_status ON orders(location_id, status);
CREATE INDEX idx_orders_location_created ON orders(location_id, created_at DESC);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Authenticated staff: full access to their location's orders
CREATE POLICY "orders_location_rw" ON orders
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

-- Public insert for QR menu customers
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "payments_location_read" ON payments
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE location_id IN (SELECT user_location_ids())
    )
  );

-- Function to safely increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
  UPDATE coupons SET current_uses = current_uses + 1 WHERE id = coupon_id;
$$ LANGUAGE sql SECURITY DEFINER;
CREATE TYPE delivery_status AS ENUM (
  'pending', 'driver_assigned', 'picked_up',
  'in_transit', 'delivered', 'cancelled', 'failed'
);

CREATE TABLE deliveries (
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

CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status) WHERE status NOT IN ('delivered', 'cancelled', 'failed');

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliveries_location_rw" ON deliveries
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders WHERE location_id IN (SELECT user_location_ids())
    )
  );
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');

CREATE TABLE coupons (
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

CREATE INDEX idx_coupons_location ON coupons(location_id, is_active);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_location_rw" ON coupons
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

-- Public: validate a coupon code (read-only, is_active check)
CREATE POLICY "coupons_public_read" ON coupons
  FOR SELECT USING (is_active = true AND valid_until >= now());

-- Add FK from orders to coupons (deferred because 007 was created first)
ALTER TABLE orders ADD CONSTRAINT orders_coupon_fk
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Helper: get the org IDs the current user belongs to
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT DISTINCT org_id
  FROM org_memberships
  WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get the location IDs the current user has access to
-- NULL location_id on membership = access to all org locations
CREATE OR REPLACE FUNCTION user_location_ids()
RETURNS SETOF UUID AS $$
  SELECT l.id
  FROM locations l
  JOIN org_memberships m ON m.org_id = l.org_id
  WHERE m.user_id = auth.uid()
    AND m.is_active = true
    AND (m.location_id IS NULL OR m.location_id = l.id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users: can read own profile
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Organizations: members can read
CREATE POLICY "org_member_read" ON organizations
  FOR SELECT USING (id IN (SELECT user_org_ids()));

-- Org owners can update
CREATE POLICY "org_owner_update" ON organizations
  FOR UPDATE USING (owner_user_id = auth.uid());

-- Locations: members can read their locations
CREATE POLICY "location_member_read" ON locations
  FOR SELECT USING (id IN (SELECT user_location_ids()));

-- Org owners/managers can insert locations
CREATE POLICY "location_owner_insert" ON locations
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'manager')
        AND is_active = true
    )
  );

CREATE POLICY "location_owner_update" ON locations
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'manager')
        AND is_active = true
    )
  );

-- Memberships: users can read their own
CREATE POLICY "membership_read_own" ON org_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Owners/managers can read all memberships in their orgs
CREATE POLICY "membership_read_org" ON org_memberships
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'manager')
        AND is_active = true
    )
  );

-- Owners can manage memberships
CREATE POLICY "membership_owner_all" ON org_memberships
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role = 'owner'
        AND is_active = true
    )
  );

-- Licenses: org members can read
CREATE POLICY "license_member_read" ON licenses
  FOR SELECT USING (org_id IN (SELECT user_org_ids()));
-- Add extra columns to licenses that the super-admin and API use
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS max_staff INT NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS modules_enabled JSONB NOT NULL DEFAULT '["kitchen","orders"]',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
