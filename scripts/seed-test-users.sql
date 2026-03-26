-- =============================================================
-- seed-test-users.sql
-- Run this in Supabase → SQL Editor AFTER creating the six
-- auth users via Authentication → Users.
--
-- Prereq: create these auth users first (use any password you like):
--   superadmin@test.headlessresto.com
--   owner@test.headlessresto.com
--   manager@test.headlessresto.com
--   cashier@test.headlessresto.com
--   kitchen@test.headlessresto.com
--   waiter@test.headlessresto.com
-- =============================================================

-- 0. Inspect the actual enum values (run this first if unsure)
-- SELECT enumlabel FROM pg_enum
-- JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
-- WHERE pg_type.typname = 'user_role'
-- ORDER BY enumsortorder;

-- 1. Upsert rows in the `users` profile table
INSERT INTO public.users (id, email, full_name)
SELECT id, email, split_part(email, '@', 1)
FROM auth.users
WHERE email IN (
  'superadmin@test.headlessresto.com',
  'owner@test.headlessresto.com',
  'manager@test.headlessresto.com',
  'cashier@test.headlessresto.com',
  'kitchen@test.headlessresto.com',
  'waiter@test.headlessresto.com'
)
ON CONFLICT (id) DO UPDATE
  SET email     = EXCLUDED.email,
      full_name = EXCLUDED.full_name;

-- 2. Create a shared test organisation (idempotent)
INSERT INTO public.organizations (name, slug, owner_user_id)
SELECT 'Test Restaurant', 'test-restaurant',
       (SELECT id FROM auth.users WHERE email = 'owner@test.headlessresto.com' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations WHERE slug = 'test-restaurant'
);

-- 3. Wire each user into org_memberships with their correct role.
--    Uses DELETE + INSERT so it works even without a unique constraint.
WITH org AS (
  SELECT id AS org_id FROM public.organizations WHERE slug = 'test-restaurant'
),
accounts (email, role) AS (
  VALUES
    ('superadmin@test.headlessresto.com', 'super_admin'::user_role),
    ('owner@test.headlessresto.com',      'owner'::user_role),
    ('manager@test.headlessresto.com',    'manager'::user_role),
    ('cashier@test.headlessresto.com',    'cashier'::user_role),
    ('kitchen@test.headlessresto.com',    'kitchen_staff'::user_role),
    ('waiter@test.headlessresto.com',     'wait_staff'::user_role)
),
to_insert AS (
  SELECT org.org_id, u.id AS user_id, a.role
  FROM accounts a
  JOIN auth.users u ON u.email = a.email
  CROSS JOIN org
)
INSERT INTO public.org_memberships (org_id, user_id, role)
SELECT org_id, user_id, role FROM to_insert
WHERE NOT EXISTS (
  SELECT 1 FROM public.org_memberships m
  WHERE m.org_id = to_insert.org_id AND m.user_id = to_insert.user_id
);

-- 4. Quick sanity check — should return 6 rows with distinct roles
SELECT u.email, m.role
FROM public.org_memberships m
JOIN auth.users u ON u.id = m.user_id
JOIN public.organizations o ON o.id = m.org_id
WHERE o.slug = 'test-restaurant'
ORDER BY m.role;
