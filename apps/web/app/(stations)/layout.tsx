import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../lib/supabase-server';

/** Fullscreen layout for KDS and POS station views — no sidebar */
export default async function StationsLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <div className="h-screen overflow-hidden bg-gray-950">{children}</div>;
}
