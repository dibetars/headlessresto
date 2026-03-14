-- ============================================================
-- RestaurantOS seed data for local development
-- Run after all migrations: supabase db reset
-- ============================================================

-- Demo organization (owner_user_id is a placeholder; replace with a real auth user ID)
INSERT INTO organizations (id, name, slug, owner_user_id, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Restaurant Group', 'demo-restaurant',
   '00000000-0000-0000-0000-000000000099', now())
ON CONFLICT DO NOTHING;

-- Demo location (org_id — correct column name)
INSERT INTO locations (id, org_id, name, address, city, state, timezone, is_active, created_at) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Downtown Branch', '123 Main St', 'San Francisco', 'CA', 'America/Los_Angeles', true, now())
ON CONFLICT DO NOTHING;

-- Demo license (org_id; max_staff + modules_enabled added by migration 011)
INSERT INTO licenses (id, org_id, tier, max_locations, max_staff, modules_enabled, hosting_expires_at) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'professional', 5, 25, '["kitchen","orders","staff","deliveries","finances"]',
   (now() + interval '1 year'))
ON CONFLICT DO NOTHING;

-- Demo menu items
INSERT INTO menu_items (id, location_id, name, description, category, price_cents, is_available, created_at) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', 'Classic Burger', 'Beef patty, lettuce, tomato, pickles', 'Mains', 1299, true, now()),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'Cheese Burger', 'Classic with American cheese', 'Mains', 1399, true, now()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', 'Veggie Burger', 'Black bean patty, avocado', 'Mains', 1199, true, now()),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000002', 'French Fries', 'Crispy seasoned fries', 'Sides', 499, true, now()),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000002', 'Onion Rings', 'Beer-battered onion rings', 'Sides', 549, true, now()),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000002', 'Coca-Cola', '12oz can', 'Drinks', 299, true, now()),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000002', 'Lemonade', 'Fresh squeezed', 'Drinks', 399, true, now()),
  ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000002', 'Chocolate Shake', 'Thick milkshake', 'Drinks', 599, true, now()),
  ('00000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000002', 'Brownie Sundae', 'Warm brownie, vanilla ice cream', 'Desserts', 699, true, now())
ON CONFLICT DO NOTHING;

-- Demo stock items
INSERT INTO stock_items (id, location_id, name, category, quantity, unit, reorder_threshold) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000002', 'Beef Patties', 'Proteins', 50, 'units', 20),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', 'Burger Buns', 'Bakery', 60, 'units', 25),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', 'Potatoes', 'Produce', 15, 'kg', 5),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000002', 'Lettuce', 'Produce', 3, 'heads', 2),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000002', 'Cheddar Cheese', 'Dairy', 2, 'kg', 1),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000002', 'Coca-Cola Cans', 'Beverages', 48, 'units', 24)
ON CONFLICT DO NOTHING;

-- Demo coupon (value column — matches schema; type 'percentage' uses value as the percent number)
INSERT INTO coupons (id, location_id, code, type, value, max_uses, current_uses, valid_from, valid_until, is_active) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000002',
   'WELCOME10', 'percentage', 10.0, 100, 0,
   now(), now() + interval '90 days', true)
ON CONFLICT DO NOTHING;
