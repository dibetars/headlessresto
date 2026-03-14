import { createClient } from '@supabase/supabase-js';

// Super-admin uses the SERVICE ROLE key — bypasses all RLS policies.
// Never expose this to the browser. All super-admin pages are server components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Regular anon client for auth sign-in only
export const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
