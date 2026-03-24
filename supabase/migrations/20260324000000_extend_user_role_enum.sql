-- Extend user_role enum with values required by the application.
-- ALTER TYPE ... ADD VALUE is safe and non-destructive (existing rows unaffected).
-- Run BEFORE seed-test-users.sql.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cashier';
