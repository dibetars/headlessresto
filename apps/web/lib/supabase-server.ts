import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Use in Server Components, Route Handlers, and Middleware */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              (cookieStore as any).set(name, value, options),
            );
          } catch {
            // Server Component — cookies can't be set, handled by middleware
          }
        },
      },
    },
  );
}
