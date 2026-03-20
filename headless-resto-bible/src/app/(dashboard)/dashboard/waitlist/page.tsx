import { getWaitlist } from '@/actions/waitlist';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmptyState from '../components/EmptyState';

export default async function WaitlistPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is super_admin
  const { data: staff } = await supabase
    .from('staff')
    .select('role')
    .eq('id', user.id)
    .single();

  if (staff?.role !== 'super_admin') {
    redirect('/dashboard');
  }

  const waitlist = await getWaitlist();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Platform <span className="text-brand-orange underline decoration-brand-orange/20">Waitlist</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Users waiting for early access or beta invitations.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            Export List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {waitlist.length === 0 ? (
          <EmptyState 
            title="Waitlist is Empty" 
            description="No users have joined the waitlist yet. Signups from the landing page will appear here."
            icon="⌛"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {waitlist.map((entry: any) => (
                  <tr key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900 tracking-tight">{entry.email}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Active
                      </span>
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
