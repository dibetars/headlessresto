CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  operating_hours JSONB DEFAULT '{}',
  stripe_account_id TEXT,
  uber_fleet_api_key_enc TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_locations_org_id ON locations(org_id);
CREATE INDEX idx_locations_active ON locations(org_id, is_active);
