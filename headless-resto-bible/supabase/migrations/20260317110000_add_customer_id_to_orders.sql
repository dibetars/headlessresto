-- Add customer_id to orders table to link orders to specific customers
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
