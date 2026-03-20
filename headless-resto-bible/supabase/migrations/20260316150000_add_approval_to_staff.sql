-- Add is_approved column to staff table
ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Update the first super_admin to be approved
-- (This will be handled by the logic below if we're seeding)

-- Seed function for test users
-- Note: This requires running in the Supabase SQL Editor
-- It creates auth users and their corresponding staff entries.

-- 1. Super Admin
-- We use a placeholder for the ID as we'll create the auth user first.
-- In Supabase SQL Editor, you can't easily create auth users via SQL without the auth schema extension and proper permissions.
-- The most reliable way is for the user to sign up, but since they're getting errors, I'll provide the SQL to insert directly into auth.users (with caution).

-- However, inserting into auth.users requires hashing passwords correctly (Bcrypt).
-- A better approach is to provide the user with a SQL script to just insert the STAFF entries, 
-- and then they can use the Signup page once I've fixed the error reporting.

-- Let's stick to the SQL script that the user can run to create these staff members once they sign up.
-- BUT the user wants them "already in the database".
