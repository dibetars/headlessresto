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
