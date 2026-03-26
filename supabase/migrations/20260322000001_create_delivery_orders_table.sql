-- Create delivery_orders table for Uber Direct integration
create table if not exists public.delivery_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  delivery_id text not null unique,
  status text not null default 'pending',
  tracking_url text,
  driver jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.delivery_orders enable row level security;

-- Restaurant admins can read their own delivery orders
create policy "Org members can read delivery orders"
  on public.delivery_orders for select
  using (
    exists (
      select 1 from public.orders o
      join public.organization_members om on om.organization_id = o.org_id
      where o.id = delivery_orders.order_id
        and om.user_id = auth.uid()
    )
  );

create index if not exists delivery_orders_order_id_idx on public.delivery_orders (order_id);
create index if not exists delivery_orders_delivery_id_idx on public.delivery_orders (delivery_id);
