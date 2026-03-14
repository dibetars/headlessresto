-- Add extra columns to licenses that the super-admin and API use
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS max_staff INT NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS modules_enabled JSONB NOT NULL DEFAULT '["kitchen","orders"]',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
