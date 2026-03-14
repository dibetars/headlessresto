CREATE TYPE license_tier AS ENUM ('starter', 'professional', 'enterprise');

CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tier license_tier NOT NULL DEFAULT 'starter',
  max_locations INT NOT NULL DEFAULT 1,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  hosting_expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_id TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_licenses_org ON licenses(org_id, is_active);
