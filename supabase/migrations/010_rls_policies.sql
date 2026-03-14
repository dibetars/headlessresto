-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Helper: get the org IDs the current user belongs to
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT DISTINCT org_id
  FROM org_memberships
  WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get the location IDs the current user has access to
-- NULL location_id on membership = access to all org locations
CREATE OR REPLACE FUNCTION user_location_ids()
RETURNS SETOF UUID AS $$
  SELECT l.id
  FROM locations l
  JOIN org_memberships m ON m.org_id = l.org_id
  WHERE m.user_id = auth.uid()
    AND m.is_active = true
    AND (m.location_id IS NULL OR m.location_id = l.id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users: can read own profile
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Organizations: members can read
CREATE POLICY "org_member_read" ON organizations
  FOR SELECT USING (id IN (SELECT user_org_ids()));

-- Org owners can update
CREATE POLICY "org_owner_update" ON organizations
  FOR UPDATE USING (owner_user_id = auth.uid());

-- Locations: members can read their locations
CREATE POLICY "location_member_read" ON locations
  FOR SELECT USING (id IN (SELECT user_location_ids()));

-- Org owners/managers can insert locations
CREATE POLICY "location_owner_insert" ON locations
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'manager')
        AND is_active = true
    )
  );

CREATE POLICY "location_owner_update" ON locations
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'manager')
        AND is_active = true
    )
  );

-- Memberships: users can read their own
CREATE POLICY "membership_read_own" ON org_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Owners/managers can read all memberships in their orgs
CREATE POLICY "membership_read_org" ON org_memberships
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'manager')
        AND is_active = true
    )
  );

-- Owners can manage memberships
CREATE POLICY "membership_owner_all" ON org_memberships
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role = 'owner'
        AND is_active = true
    )
  );

-- Licenses: org members can read
CREATE POLICY "license_member_read" ON licenses
  FOR SELECT USING (org_id IN (SELECT user_org_ids()));
