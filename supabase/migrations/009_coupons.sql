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
