import { createServerSupabaseClient } from '../../lib/supabase-server';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Orders", value: '—', sub: 'Live orders' },
          { label: "Today's Revenue", value: '—', sub: 'Completed orders' },
          { label: 'Active Staff', value: '—', sub: 'Clocked in now' },
          { label: 'Low Stock Alerts', value: '—', sub: 'Items below threshold' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
