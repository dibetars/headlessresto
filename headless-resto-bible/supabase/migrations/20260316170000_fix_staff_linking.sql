-- Migration to fix RLS and linking issues for the staff table
-- This allows the server action (using anon key) to manage staff entries during signup.

-- 1. Ensure RLS is enabled
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for the staff table
-- Allow anyone to read staff (needed for lookup during signup)
CREATE POLICY "Allow public read access on staff"
ON staff FOR SELECT
USING (true);

-- Allow authenticated users to update their own staff record
-- (This is used during the linking process in signup action)
CREATE POLICY "Allow users to update their own staff record"
ON staff FOR UPDATE
TO authenticated
USING (auth.uid() = id OR email = auth.email())
WITH CHECK (auth.uid() = id OR email = auth.email());

-- Allow anyone to insert into staff (needed for new signups)
-- Note: In a production app, you might want to restrict this further,
-- but for the signup flow to work with the anon key, this is necessary.
CREATE POLICY "Allow anyone to insert staff"
ON staff FOR INSERT
WITH CHECK (true);

-- 3. Fix shifts table to handle ID updates (for linking pre-seeded users)
ALTER TABLE shifts 
DROP CONSTRAINT IF EXISTS shifts_staff_id_fkey,
ADD CONSTRAINT shifts_staff_id_fkey 
    FOREIGN KEY (staff_id) 
    REFERENCES staff(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;
