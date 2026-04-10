-- Add driver detail columns and raw_payload to delivery_orders
-- (webhook handler writes these; missing from original migration)
ALTER TABLE public.delivery_orders
  ADD COLUMN IF NOT EXISTS driver_name         text,
  ADD COLUMN IF NOT EXISTS driver_rating        text,
  ADD COLUMN IF NOT EXISTS driver_photo_url     text,
  ADD COLUMN IF NOT EXISTS driver_vehicle       text,
  ADD COLUMN IF NOT EXISTS driver_license_plate text,
  ADD COLUMN IF NOT EXISTS raw_payload          jsonb;
