-- Add organization_id to menu_items for proper multi-tenant scoping
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS menu_items_organization_id_idx ON public.menu_items (organization_id);
