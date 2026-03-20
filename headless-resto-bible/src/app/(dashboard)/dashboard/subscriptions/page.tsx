import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmptyState from '../components/EmptyState';

export default async function SubscriptionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('role, name')
    .eq('id', user.id)
    .single();

  if (staff?.role !== 'super_admin') {
    redirect('/dashboard');
  }

  // Fetch real subscriptions joined with restaurants
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      restaurants (
        name
      )
    `)
    .order('created_at', { ascending: false });

  // Calculate real stats
  const activeSubs = subscriptions?.filter(s => s.status === 'active').length || 0;
  const totalMRR = subscriptions?.reduce((acc, s) => acc + (s.status === 'active' ? Number(s.amount) : 0), 0) || 0;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Subscription <span className="text-brand-orange underline decoration-brand-orange/20">Nexus</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Global revenue and plan management.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[20px]">
          <button className="px-6 py-2 rounded-[18px] text-xs font-black text-slate-900 bg-white shadow-sm">Monthly</button>
          <button className="px-6 py-2 rounded-[18px] text-xs font-black text-slate-500">Annual</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total MRR', value: `$${totalMRR.toLocaleString()}`, color: 'brand-blue', icon: '📈' },
          { label: 'Active Subs', value: activeSubs.toString(), color: 'brand-orange', icon: '🏪' },
          { label: 'Churn Rate', value: '1.2%', color: 'brand-blue', icon: '📉' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {!subscriptions || subscriptions.length === 0 ? (
          <EmptyState 
            title="No Subscriptions" 
            description="There are currently no active or past subscriptions in the system. As partners join, they will appear here."
            icon="🏪"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Billing</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscriptions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 group-hover:text-brand-blue transition-colors">{sub.restaurants?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">ID: {sub.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                        sub.status === 'past_due' ? 'bg-amber-50 text-amber-600' : 
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900">${Number(sub.amount).toLocaleString()}</td>
                    <td className="px-8 py-6 font-bold text-slate-500">{new Date(sub.next_billing).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-slate-400 hover:text-brand-orange p-2 transition-colors">
                        •••
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}