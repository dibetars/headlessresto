-- Fix RLS policies for staff linking during signup
-- This allows the 'anon' key used in server actions to update staff records by email.

-- 1. Drop existing update policy
DROP POLICY IF EXISTS "Allow users to update their own staff record" ON staff;

-- 2. Create a more permissive update policy for the linking process
-- This allows both 'anon' and 'authenticated' roles to update staff records.
-- We restrict it to email matching in the server action logic itself for security.
CREATE POLICY "Allow staff update for linking"
ON staff FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 3. Ensure insert policy is also available to public
DROP POLICY IF EXISTS "Allow anyone to insert staff" ON staff;
CREATE POLICY "Allow anyone to insert staff"
ON staff FOR INSERT
TO public
WITH CHECK (true);
