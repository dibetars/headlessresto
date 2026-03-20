CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  status VARCHAR(50) DEFAULT 'available', -- available, occupied, reserved
  qr_code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table_id to orders to link orders to specific tables
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id);
