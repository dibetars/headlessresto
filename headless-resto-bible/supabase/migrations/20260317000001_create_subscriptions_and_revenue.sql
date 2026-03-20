
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('Basic', 'Pro', 'Enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled')),
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    next_billing TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenue table
CREATE TABLE IF NOT EXISTS revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'fee', 'payout')),
    status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing super_admin access)
CREATE POLICY "Super admins can manage all subscriptions"
ON subscriptions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM staff
        WHERE staff.id = auth.uid()
        AND staff.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can manage all revenue records"
ON revenue
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM staff
        WHERE staff.id = auth.uid()
        AND staff.role = 'super_admin'
    )
);

-- Add some initial mock data for development
-- First, add some restaurants
INSERT INTO restaurants (id, name, owner, location, status, revenue, joined_date) VALUES
('11111111-1111-1111-1111-111111111111', 'The Golden Fork', 'Marco Rossi', 'New York, NY', 'active', '$12,400', 'Nov 12, 2025'),
('22222222-2222-2222-2222-222222222222', 'Sushi Zen', 'Aki Tanaka', 'San Francisco, CA', 'active', '$8,900', 'Jan 5, 2026'),
('33333333-3333-3333-3333-333333333333', 'Burger Theory', 'John Doe', 'Chicago, IL', 'pending', '$0', 'Mar 15, 2026'),
('44444444-4444-4444-4444-444444444444', 'Pasta la Vista', 'Lucia Bianchi', 'active', 'Miami, FL', '$15,200', 'Aug 20, 2025'),
('55555555-5555-5555-5555-555555555555', 'Taco Haven', 'Carlos Gomez', 'Austin, TX', 'suspended', '$4,100', 'Dec 1, 2025')
ON CONFLICT (id) DO NOTHING;

-- Then add subscriptions
INSERT INTO subscriptions (restaurant_id, plan, status, amount, next_billing) VALUES
('11111111-1111-1111-1111-111111111111', 'Pro', 'active', 199.00, NOW() + INTERVAL '26 days'),
('22222222-2222-2222-2222-222222222222', 'Basic', 'active', 99.00, NOW() + INTERVAL '19 days'),
('44444444-4444-4444-4444-444444444444', 'Enterprise', 'active', 499.00, NOW() + INTERVAL '34 days'),
('55555555-5555-5555-5555-555555555555', 'Pro', 'past_due', 199.00, NOW() - INTERVAL '16 days');

-- Finally add revenue records
INSERT INTO revenue (amount, type, status, date) VALUES
(199.00, 'subscription', 'completed', NOW() - INTERVAL '0 days'),
(499.00, 'subscription', 'completed', NOW() - INTERVAL '1 days'),
(-1200.00, 'payout', 'pending', NOW() - INTERVAL '1 days'),
(99.00, 'subscription', 'completed', NOW() - INTERVAL '2 days'),
(199.00, 'subscription', 'failed', NOW() - INTERVAL '3 days');
