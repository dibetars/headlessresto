import { getLeads } from '@/actions/leads';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LeadStatusBadge from './components/LeadStatusBadge';
import LeadActions from './components/LeadActions';
import EmptyState from '../components/EmptyState';

export default async function LeadsPage() {
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

  const leads = await getLeads();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Inbound <span className="text-brand-orange underline decoration-brand-orange/20">Leads</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage consultation requests and contact inquiries.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            Export Leads
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {leads.length === 0 ? (
          <EmptyState 
            title="No Leads Found" 
            description="There are currently no inbound leads from the platform. New submissions will appear here automatically."
            icon="🎯"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject/Message</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        lead.type === 'consultation' 
                          ? 'bg-brand-blue/10 text-brand-blue' 
                          : 'bg-brand-orange/10 text-brand-orange'
                      }`}>
                        {lead.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 tracking-tight">{lead.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{lead.email || lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 truncate">{lead.subject || 'Consultation Request'}</span>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{lead.message || 'No message provided.'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <LeadActions leadId={lead.id} currentStatus={lead.status} />
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
