-- Create leads table for contact form submissions and consultation requests
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'consultation' or 'contact'
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public submissions)
CREATE POLICY "Allow public insert" ON leads FOR INSERT WITH CHECK (true);

-- Allow super_admin to select, update, and delete
CREATE POLICY "Allow super_admin select" ON leads FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.id = auth.uid() AND staff.role = 'super_admin'
  )
);

CREATE POLICY "Allow super_admin update" ON leads FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.id = auth.uid() AND staff.role = 'super_admin'
  )
);

CREATE POLICY "Allow super_admin delete" ON leads FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.id = auth.uid() AND staff.role = 'super_admin'
  )
);
