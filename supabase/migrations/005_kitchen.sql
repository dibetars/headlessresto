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
