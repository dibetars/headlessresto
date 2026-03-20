import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmptyState from '../components/EmptyState';

export default async function PlatformRevenuePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('role')
    .eq('id', user.id)
    .single();

  if (staff?.role !== 'super_admin') {
    redirect('/dashboard');
  }

  // Fetch real revenue records
  const { data: revenueRecords } = await supabase
    .from('revenue')
    .select('*')
    .order('date', { ascending: false });

  // Calculate real stats
  const totalVolume = revenueRecords?.reduce((acc, r) => acc + (r.amount > 0 ? Number(r.amount) : 0), 0) || 0;
  const platformFees = totalVolume * 0.05; // Assuming 5% platform fee
  const pendingPayouts = Math.abs(revenueRecords?.filter(r => r.type === 'payout' && r.status === 'pending').reduce((acc, r) => acc + Number(r.amount), 0) || 0);
  const netProfit = platformFees; // Simplified profit calculation

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Platform <span className="text-brand-orange underline decoration-brand-orange/20">Revenue</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time financial performance and transaction history.</p>
        </div>
        <button className="px-6 py-3 bg-brand-blue text-brand-orange rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 shadow-xl shadow-brand-blue/20 transition-all">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: `$${totalVolume.toLocaleString()}`, color: 'brand-blue', icon: '💰' },
          { label: 'Platform Fees', value: `$${platformFees.toLocaleString()}`, color: 'brand-orange', icon: '💎' },
          { label: 'Pending Payouts', value: `$${pendingPayouts.toLocaleString()}`, color: 'brand-blue', icon: '⏳' },
          { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, color: 'brand-orange', icon: '📈' },
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
        {!revenueRecords || revenueRecords.length === 0 ? (
          <EmptyState 
            title="No Revenue Data" 
            description="The transaction ledger is currently empty. Financial data will be recorded as payments are processed."
            icon="💰"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {revenueRecords.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 group-hover:text-brand-blue transition-colors uppercase tracking-tight">{rev.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-500">{new Date(rev.date).toLocaleDateString()}</td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {rev.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        rev.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                        rev.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className={`px-8 py-6 text-right font-black ${Number(rev.amount) < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                      {Number(rev.amount) < 0 ? `- $${Math.abs(Number(rev.amount)).toLocaleString()}` : `$${Number(rev.amount).toLocaleString()}`}
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