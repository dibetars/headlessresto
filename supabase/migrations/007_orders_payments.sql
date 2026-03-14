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
