-- Create plans table for landing page pricing
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  old_price TEXT,
  save_label TEXT,
  features TEXT[] NOT NULL,
  is_dark BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on plans" ON plans FOR SELECT USING (true);

-- Insert initial plan data
INSERT INTO plans (name, price, old_price, save_label, features, is_dark, is_popular, display_order) VALUES
('Monthly payment', '$47', '$50', 'save 5%', ARRAY['quick menu', 'access for one waiter', 'access for one owner', 'online technical support', '14 days free trial period'], false, false, 1),
('Payment for six months', '$72', '$80', 'save 10%', ARRAY['quick menu', 'access for one waiter', 'access for one owner', 'online technical support', '14 days free trial period'], false, true, 2),
('Payment for a year', '$104', '$130', 'save 20%', ARRAY['quick menu', 'access for one waiter', 'access for one owner', 'online technical support', '14 days free trial period'], true, false, 3);
