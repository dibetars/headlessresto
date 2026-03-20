import { createClient } from '@/lib/supabase/server';
import { updateRestaurantStatus } from '@/actions/restaurants';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardRealtimeTracker from './components/DashboardRealtimeTracker';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: staff } = await supabase
    .from('staff')
    .select('role, name')
    .eq('id', user?.id)
    .single();

  const isSuperAdmin = staff?.role === 'super_admin';

  if (isSuperAdmin) {
    const { data: pendingRestaurants } = await supabase
      .from('restaurants')
      .select('*')
      .eq('status', 'pending');

    const { data: activeRestaurants } = await supabase
      .from('restaurants')
      .select('*')
      .eq('status', 'active');

    const { data: revenueData } = await supabase
      .from('revenue')
      .select('amount')
      .eq('status', 'completed');

    const { count: staffCount } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true });

    const { data: recentLeads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: recentWaitlist } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: recentReservations } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: recentStaff } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    // Calculate real growth (mocked for visualization, but based on real count)
    const totalRevenue = revenueData?.reduce((acc, r) => acc + (r.amount > 0 ? Number(r.amount) : 0), 0) || 0;
    
    // Fetch last 7 days revenue for growth chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentRevenue } = await supabase
      .from('revenue')
      .select('amount, date')
      .gte('date', sevenDaysAgo.toISOString())
      .order('date', { ascending: true });

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Platform Overview</h1>
            <p className="text-slate-500 mt-1">Welcome back, {staff?.name}. Here's what's happening across the HeadlessResto network.</p>
          </div>
          <DashboardRealtimeTracker />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: '💰', color: 'brand-blue' },
            { label: 'Active Restaurants', value: (activeRestaurants?.length || 0).toString(), change: `+${activeRestaurants?.length || 0} total`, icon: '🏪', color: 'brand-orange' },
            { label: 'Pending Approvals', value: (pendingRestaurants?.length || 0).toString(), change: 'Action required', icon: '⏳', urgent: true, color: 'brand-orange' },
            { label: 'Platform Staff', value: (staffCount || 0).toString(), change: '+18%', icon: '👥', color: 'brand-blue' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${stat.urgent ? 'bg-brand-orange text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Subscription <span className="text-brand-orange underline decoration-brand-orange/20">Growth</span></h3>
              <select className="text-xs font-black border-none bg-slate-50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-blue/10 outline-none">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-72 w-full bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-center space-y-2">
                <p className="text-slate-400 text-sm font-bold italic relative z-10">Real-time revenue visualization</p>
                <div className="flex items-end space-x-1 h-20">
                  {recentRevenue && recentRevenue.length > 0 ? recentRevenue.map((r, i) => (
                    <div 
                      key={i} 
                      className="w-4 bg-brand-blue/20 rounded-t-sm transition-all hover:bg-brand-blue" 
                      style={{ height: `${Math.min(100, (Number(r.amount) / 1000) * 100)}%` }}
                    />
                  )) : (
                    [40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <div key={i} className="w-4 bg-slate-200 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Establishments */}
          <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl shadow-slate-900/20 text-white">
            <h3 className="text-xl font-black mb-8 tracking-tight italic uppercase">New <span className="text-brand-orange">Requests</span></h3>
            <div className="space-y-4">
              {pendingRestaurants && pendingRestaurants.length > 0 ? pendingRestaurants.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-orange/30 transition-all group cursor-pointer">
                  <div>
                    <p className="font-black text-white group-hover:text-brand-orange transition-colors tracking-tight">{req.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{req.owner} • {req.location}</p>
                  </div>
                  <form action={async () => {
                    'use server';
                    await updateRestaurantStatus(req.id, 'active');
                  }}>
                    <button type="submit" className="text-[10px] font-black text-brand-orange uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Approve</button>
                  </form>
                </div>
              )) : (
                <p className="text-slate-400 text-sm font-bold italic">No pending requests.</p>
              )}
            </div>
            <button className="w-full mt-8 py-4 text-xs font-black text-slate-400 hover:text-brand-orange border-t border-white/5 transition-colors uppercase tracking-widest">
              View All Requests →
            </button>
          </div>
        </div>

        {/* Unified Submissions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Leads */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8 italic uppercase tracking-tight">Recent <span className="text-brand-blue">Leads</span></h3>
            <div className="space-y-4">
              {recentLeads && recentLeads.length > 0 ? recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 hover:bg-slate-100 transition-all group cursor-pointer">
                  <div>
                    <p className="font-black text-slate-900 tracking-tight group-hover:text-brand-blue transition-colors">{lead.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{lead.type} • {lead.email || lead.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    lead.status === 'new' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              )) : (
                <p className="text-slate-400 text-sm font-bold italic">No recent leads.</p>
              )}
            </div>
            <Link href="/dashboard/leads" className="w-full mt-8 py-4 text-xs font-black text-slate-400 hover:text-brand-orange border-t border-slate-100 transition-colors uppercase tracking-widest text-center block">
              Manage All Leads →
            </Link>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-8 italic uppercase tracking-tight">Waitlist <span className="text-brand-orange">Signups</span></h3>
            <div className="space-y-4 flex-1">
              {recentWaitlist && recentWaitlist.length > 0 ? recentWaitlist.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div>
                    <p className="font-black text-slate-900 group-hover:text-brand-blue transition-colors tracking-tight">{entry.email}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Joined {new Date(entry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-sm font-bold italic">No recent waitlist signups.</p>
              )}
            </div>
            <Link href="/dashboard/waitlist" className="w-full mt-8 py-4 text-xs font-black text-slate-400 hover:text-brand-orange border-t border-slate-100 transition-colors uppercase tracking-widest text-center block">
              Manage Waitlist →
            </Link>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-8 italic uppercase tracking-tight">Global <span className="text-brand-blue">Reservations</span></h3>
            <div className="space-y-4 flex-1">
              {recentReservations && recentReservations.length > 0 ? recentReservations.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 hover:bg-slate-100 transition-all group cursor-pointer">
                  <div>
                    <p className="font-black text-slate-900 tracking-tight group-hover:text-brand-blue transition-colors">{res.customer_name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{res.reservation_date} @ {res.reservation_time} • {res.number_of_guests} Guests</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-orange/10 text-brand-orange'
                  }`}>
                    {res.status}
                  </span>
                </div>
              )) : (
                <p className="text-slate-400 text-sm font-bold italic">No recent reservations.</p>
              )}
            </div>
            <Link href="/reservations" className="w-full mt-8 py-4 text-xs font-black text-slate-400 hover:text-brand-orange border-t border-slate-100 transition-colors uppercase tracking-widest text-center block">
              Manage Reservations →
            </Link>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-8 italic uppercase tracking-tight">Platform <span className="text-brand-orange">Staff</span></h3>
            <div className="space-y-4 flex-1">
              {recentStaff && recentStaff.length > 0 ? recentStaff.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 hover:bg-slate-100 transition-all group cursor-pointer">
                  <div>
                    <p className="font-black text-slate-900 tracking-tight group-hover:text-brand-blue transition-colors">{s.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.role} • {s.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    s.is_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {s.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              )) : (
                <p className="text-slate-400 text-sm font-bold italic">No recent staff activity.</p>
              )}
            </div>
            <Link href="/staff" className="w-full mt-8 py-4 text-xs font-black text-slate-400 hover:text-brand-orange border-t border-slate-100 transition-colors uppercase tracking-widest text-center block">
              Manage Platform Staff →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant-specific dashboard (for owners/managers)
  // Fetch real data for restaurant ops
  const { data: activeOrders } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['pending', 'in-progress']);

  const { data: completedOrdersToday } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'completed')
    .gte('created_at', new Date().toISOString().split('T')[0]);

  const { count: totalTables } = await supabase
    .from('tables')
    .select('*', { count: 'exact', head: true });

  const { count: occupiedTables } = await supabase
    .from('tables')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'occupied');

  const dailySales = completedOrdersToday?.reduce((acc, o) => acc + Number(o.total), 0) || 0;
  const avgTicket = completedOrdersToday && completedOrdersToday.length > 0 
    ? dailySales / completedOrdersToday.length 
    : 0;
  const tableOccupancy = totalTables && totalTables > 0 
    ? Math.round((occupiedTables || 0) / totalTables * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Restaurant Ops</h1>
          <p className="text-slate-500 mt-1">Operational hub for your establishment.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[20px]">
          <button className="px-6 py-2 rounded-[18px] text-xs font-black text-slate-900 bg-white shadow-sm">Today</button>
          <button className="px-6 py-2 rounded-[18px] text-xs font-black text-slate-500">This Week</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Live Orders', value: (activeOrders?.length || 0).toString(), change: `${activeOrders?.filter(o => o.status === 'pending').length || 0} pending`, icon: '🔥', color: 'brand-orange' },
          { label: 'Daily Sales', value: `$${dailySales.toLocaleString()}`, change: `+${completedOrdersToday?.length || 0} orders`, icon: '💰', color: 'brand-blue' },
          { label: 'Avg. Ticket', value: `$${avgTicket.toFixed(2)}`, change: 'Consistent', icon: '🎫', color: 'brand-blue' },
          { label: 'Table Status', value: `${tableOccupancy}%`, change: `${occupiedTables || 0}/${totalTables || 0} occupied`, icon: '🪑', color: 'brand-orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${stat.label === 'Live Orders' ? 'bg-brand-orange text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 italic uppercase tracking-tight">Active <span className="text-brand-orange">Orders</span></h3>
          <div className="space-y-4">
            {activeOrders && activeOrders.length > 0 ? activeOrders.slice(0, 3).map((order, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div>
                  <p className="font-black text-slate-900 group-hover:text-brand-blue transition-colors tracking-tight">#{order.id.slice(0, 4)} — {order.status}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total: ${Number(order.total).toFixed(2)}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-brand-blue/10 text-brand-blue'
                }`}>
                  {order.status}
                </span>
              </div>
            )) : (
              <p className="text-slate-400 text-sm font-bold italic">No active orders.</p>
            )}
          </div>
          <button className="w-full mt-8 py-4 text-xs font-black text-slate-400 hover:text-brand-blue border-t border-slate-100 transition-colors uppercase tracking-widest">
            View All Orders →
          </button>
        </div>

        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl shadow-slate-900/20 text-white">
          <h3 className="text-xl font-black mb-8 italic uppercase tracking-tight">Kitchen <span className="text-brand-orange underline decoration-brand-orange/20">Pulse</span></h3>
          <div className="h-64 w-full bg-white/5 rounded-[32px] border-2 border-dashed border-white/10 flex items-center justify-center">
            <p className="text-slate-500 text-sm font-bold italic">Real-time KDS feed connecting...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
