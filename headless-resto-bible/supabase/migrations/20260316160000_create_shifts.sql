-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, in-progress, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON shifts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access" ON shifts FOR ALL USING (auth.role() = 'authenticated');
