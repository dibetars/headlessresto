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
