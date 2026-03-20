-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- active, pending, suspended
  revenue TEXT DEFAULT '$0',
  joined_date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Allow all for now (development)
CREATE POLICY "Allow all for now" ON restaurants FOR ALL USING (true);
