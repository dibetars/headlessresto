import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../lib/supabase-server';
import { Sidebar } from '../../components/sidebar';
import { LocationSwitcher } from '../../components/location-switcher';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get user's memberships + locations
  const { data: memberships } = await supabase
    .from('org_memberships')
    .select('role, org_id, organizations(id, name), locations(id, name, city, is_active)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!memberships) redirect('/onboarding');

  const org = (memberships as any).organizations;
  const role = memberships.role;

  // Get all locations for this org
  const { data: allLocations } = await supabase
    .from('locations')
    .select('*')
    .eq('org_id', org.id)
    .eq('is_active', true)
    .order('name');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={role} orgName={org.name} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div />
          <LocationSwitcher
            locations={allLocations || []}
            current={allLocations?.[0] || null}
            onChange={() => {}}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
