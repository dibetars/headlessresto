-- =============================================================
-- seed-demo-data.sql
-- Run AFTER:
--   1. seed-test-users.sql
--   2. 20260326000000_add_missing_org_columns.sql migration
-- =============================================================

-- ── Resolve org ──────────────────────────────────────────────
DO $$
DECLARE
  v_org_id    uuid;
  v_loc_id    uuid;
BEGIN

SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'test-restaurant';
IF v_org_id IS NULL THEN
  RAISE EXCEPTION 'org not found — run seed-test-users.sql first';
END IF;

-- ── 0. Ensure a location exists for this org ──────────────────
SELECT id INTO v_loc_id FROM public.locations WHERE org_id = v_org_id LIMIT 1;
IF v_loc_id IS NULL THEN
  INSERT INTO public.locations (org_id, name, address, city, state, zip, timezone, is_active)
  VALUES (v_org_id, 'Main Location', '1 High Street', 'London', 'England', 'EC1A 1BB', 'Europe/London', true)
  RETURNING id INTO v_loc_id;
END IF;

-- ── 1. Menu items (no org FK — global table) ──────────────────
INSERT INTO public.menu_items (name, description, price, category)
SELECT name, description, price, category
FROM (VALUES
  ('Crispy Calamari',       'Lightly battered squid with lemon aioli',         12.00, 'Starters'),
  ('Burrata & Tomato',      'Buffalo burrata, heirloom tomatoes, basil oil',    14.00, 'Starters'),
  ('Chicken Caesar',        'Romaine, parmesan, croutons, house dressing',      13.50, 'Starters'),
  ('Beef Short Rib',        '12hr braised rib, truffle mash, red wine jus',     34.00, 'Mains'),
  ('Pan Seared Salmon',     'Atlantic salmon, crushed peas, dill butter',       28.00, 'Mains'),
  ('Wild Mushroom Risotto', 'Arborio, porcini, truffle oil, aged parmesan',     22.00, 'Mains'),
  ('Grilled Chicken',       'Free-range breast, herb butter, seasonal veg',     24.00, 'Mains'),
  ('Margherita Pizza',      'San marzano, fior di latte, fresh basil',          18.00, 'Mains'),
  ('Chocolate Fondant',     'Warm dark chocolate, vanilla ice cream',           10.00, 'Desserts'),
  ('Creme Brulee',          'Classic vanilla custard, caramelised sugar',        9.00, 'Desserts'),
  ('Tiramisu',              'Espresso, mascarpone, cocoa',                       9.50, 'Desserts'),
  ('Still Water',           '500ml bottle',                                      3.50, 'Drinks'),
  ('Sparkling Water',       '500ml bottle',                                      3.50, 'Drinks'),
  ('House Red Wine',        'Glass 175ml',                                       8.50, 'Drinks'),
  ('House White Wine',      'Glass 175ml',                                       8.50, 'Drinks'),
  ('Craft Lager',           '330ml bottle',                                      6.00, 'Drinks'),
  ('Espresso',              'Double shot',                                       3.00, 'Drinks'),
  ('Flat White',            'Double espresso, steamed milk',                     4.50, 'Drinks')
) AS t(name, description, price, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.menu_items WHERE name = t.name
);

-- ── 2. Tables ─────────────────────────────────────────────────
INSERT INTO public.tables (org_id, table_number, capacity, status)
SELECT v_org_id, table_number, capacity, status
FROM (VALUES
  ('T1',  2, 'available'),
  ('T2',  2, 'occupied'),
  ('T3',  4, 'available'),
  ('T4',  4, 'occupied'),
  ('T5',  4, 'reserved'),
  ('T6',  6, 'available'),
  ('T7',  6, 'occupied'),
  ('T8',  8, 'available'),
  ('T9',  2, 'cleaning'),
  ('T10', 4, 'available')
) AS t(table_number, capacity, status)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tables WHERE org_id = v_org_id AND table_number = t.table_number
);

-- ── 3. Orders ─────────────────────────────────────────────────
INSERT INTO public.orders (org_id, type, status, total, payment_method, payment_status, created_at)
SELECT v_org_id, type, status, total, payment_method, 'paid', created_at
FROM (VALUES
  ('dine_in',  'completed', 89.50,  'card',  NOW() - INTERVAL '7 days'),
  ('dine_in',  'completed', 124.00, 'card',  NOW() - INTERVAL '6 days'),
  ('takeaway', 'completed', 42.50,  'cash',  NOW() - INTERVAL '5 days'),
  ('dine_in',  'completed', 67.00,  'card',  NOW() - INTERVAL '5 days'),
  ('delivery', 'completed', 55.50,  'card',  NOW() - INTERVAL '4 days'),
  ('dine_in',  'completed', 198.00, 'card',  NOW() - INTERVAL '3 days'),
  ('takeaway', 'completed', 36.00,  'cash',  NOW() - INTERVAL '2 days'),
  ('dine_in',  'completed', 145.50, 'card',  NOW() - INTERVAL '2 days'),
  ('dine_in',  'preparing', 78.00,  'card',  NOW() - INTERVAL '1 hour'),
  ('dine_in',  'pending',   92.00,  'card',  NOW() - INTERVAL '30 minutes'),
  ('takeaway', 'preparing', 44.50,  'cash',  NOW() - INTERVAL '15 minutes'),
  ('dine_in',  'pending',   63.00,  'card',  NOW() - INTERVAL '5 minutes')
) AS t(type, status, total, payment_method, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.orders WHERE org_id = v_org_id LIMIT 1
);

-- ── 4. Order items ────────────────────────────────────────────
-- Attach one menu item to each of the 12 orders we just inserted
WITH recent_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM public.orders WHERE org_id = v_org_id
),
first_menu AS (
  SELECT id FROM public.menu_items ORDER BY created_at LIMIT 1
)
INSERT INTO public.order_items (order_id, menu_item_id, quantity, price)
SELECT o.id, m.id, 2, 18.00
FROM recent_orders o, first_menu m
WHERE NOT EXISTS (
  SELECT 1 FROM public.order_items oi WHERE oi.order_id = o.id
);

-- ── 5. Reservations ───────────────────────────────────────────
INSERT INTO public.reservations (org_id, customer_name, customer_email, customer_phone, reservation_date, reservation_time, number_of_guests, status)
SELECT v_org_id, customer_name, customer_email, customer_phone, reservation_date, reservation_time::time, guests, status
FROM (VALUES
  ('James Harrington', 'james.h@email.com',  '+44 7700 900001', CURRENT_DATE,     '12:30', 4, 'confirmed'),
  ('Sophia Laurent',   'sophia.l@email.com', '+44 7700 900002', CURRENT_DATE,     '13:00', 2, 'confirmed'),
  ('Marcus Okafor',    'marcus.o@email.com', '+44 7700 900003', CURRENT_DATE,     '19:00', 6, 'pending'),
  ('Emily Chen',       'emily.c@email.com',  '+44 7700 900004', CURRENT_DATE,     '19:30', 3, 'confirmed'),
  ('David Park',       'david.p@email.com',  '+44 7700 900005', CURRENT_DATE,     '20:00', 8, 'confirmed'),
  ('Aisha Patel',      'aisha.p@email.com',  '+44 7700 900006', CURRENT_DATE + 1, '12:00', 2, 'pending'),
  ('Tom Whitfield',    'tom.w@email.com',    '+44 7700 900007', CURRENT_DATE + 1, '19:00', 4, 'confirmed'),
  ('Nina Rossi',       'nina.r@email.com',   '+44 7700 900008', CURRENT_DATE + 2, '20:30', 5, 'pending'),
  ('George Mills',     'george.m@email.com', '+44 7700 900009', CURRENT_DATE - 1, '18:00', 2, 'confirmed'),
  ('Priya Sharma',     'priya.s@email.com',  '+44 7700 900010', CURRENT_DATE - 2, '19:30', 4, 'confirmed')
) AS t(customer_name, customer_email, customer_phone, reservation_date, reservation_time, guests, status)
WHERE NOT EXISTS (
  SELECT 1 FROM public.reservations WHERE org_id = v_org_id LIMIT 1
);

-- ── 6. Stock items ────────────────────────────────────────────
INSERT INTO public.stock_items (org_id, location_id, name, quantity, unit, category, reorder_threshold, cost_per_unit_cents)
SELECT v_org_id, v_loc_id, name, quantity, unit, category, reorder_threshold, cost_per_unit_cents
FROM (VALUES
  ('Beef Short Rib',     24,  'kg',      'Protein',   5,  2500),
  ('Atlantic Salmon',    18,  'kg',      'Protein',   4,  1800),
  ('Arborio Rice',       12,  'kg',      'Dry Goods', 3,  300),
  ('San Marzano Tomato', 48,  'cans',    'Canned',    10, 250),
  ('Burrata',            30,  'balls',   'Dairy',     8,  450),
  ('Dark Chocolate',     8,   'kg',      'Baking',    2,  1200),
  ('Heavy Cream',        20,  'litres',  'Dairy',     5,  180),
  ('Parmesan',           6,   'kg',      'Dairy',     2,  900),
  ('Olive Oil',          15,  'litres',  'Oils',      3,  600),
  ('House Red Wine',     36,  'bottles', 'Beverages', 12, 800),
  ('House White Wine',   42,  'bottles', 'Beverages', 12, 700),
  ('Craft Lager',        120, 'bottles', 'Beverages', 24, 150),
  ('Espresso Beans',     8,   'kg',      'Beverages', 2,  1400),
  ('Plain Flour',        25,  'kg',      'Dry Goods', 5,  80),
  ('Butter',             12,  'kg',      'Dairy',     3,  600)
) AS t(name, quantity, unit, category, reorder_threshold, cost_per_unit_cents)
WHERE NOT EXISTS (
  SELECT 1 FROM public.stock_items WHERE org_id = v_org_id LIMIT 1
);

END $$;

-- ── Sanity check ──────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM public.menu_items)                                                          AS menu_items,
  (SELECT COUNT(*) FROM public.tables       WHERE org_id = (SELECT id FROM public.organizations WHERE slug='test-restaurant')) AS tables,
  (SELECT COUNT(*) FROM public.orders       WHERE org_id = (SELECT id FROM public.organizations WHERE slug='test-restaurant')) AS orders,
  (SELECT COUNT(*) FROM public.reservations WHERE org_id = (SELECT id FROM public.organizations WHERE slug='test-restaurant')) AS reservations,
  (SELECT COUNT(*) FROM public.stock_items  WHERE org_id = (SELECT id FROM public.organizations WHERE slug='test-restaurant')) AS stock_items;
