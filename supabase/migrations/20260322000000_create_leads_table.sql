-- Create leads table for marketing lead capture forms
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text,
  contact_person text not null,
  email text not null,
  phone text,
  num_locations text,
  plan_interest text,
  team_size text,
  preferred_time text,
  message text,
  current_system text,
  integration_needs text,
  source text check (source in ('homepage', 'get-started', 'book-demo', 'contact')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.leads enable row level security;

-- Only service role (admin) can read leads — marketing team uses Supabase dashboard
create policy "Service role only" on public.leads
  using (false)
  with check (false);

-- Index for common queries
create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
