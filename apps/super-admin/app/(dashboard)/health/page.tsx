import { supabaseAdmin } from '../../../lib/supabase';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
// Revalidate every 30 seconds
export const revalidate = 30;

async function getHealthMetrics() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalOrgs },
    { count: activeOrgs },
    { count: ordersToday },
    { count: ordersWeek },
    { count: failedPayments },
    { count: activeDeliveries },
    { count: pendingOrders },
    { data: recentOrgs },
  ] = await Promise.all([
    supabaseAdmin.from('organizations').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('licenses').select('*', { count: 'exact', head: true }).gte('hosting_expires_at', now.toISOString()),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', last24h),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', last7d),
    supabaseAdmin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', last24h),
    supabaseAdmin.from('deliveries').select('*', { count: 'exact', head: true }).not('status', 'in', '(delivered,cancelled,failed)'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('organizations').select('name, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    totalOrgs: totalOrgs ?? 0,
    activeOrgs: activeOrgs ?? 0,
    ordersToday: ordersToday ?? 0,
    ordersWeek: ordersWeek ?? 0,
    failedPayments: failedPayments ?? 0,
    activeDeliveries: activeDeliveries ?? 0,
    pendingOrders: pendingOrders ?? 0,
    recentOrgs: recentOrgs ?? [],
  };
}

function StatusIcon({ ok }: { ok: boolean | null }) {
  if (ok === null) return <AlertCircle className="w-5 h-5 text-amber-400" />;
  return ok
    ? <CheckCircle className="w-5 h-5 text-green-400" />
    : <XCircle className="w-5 h-5 text-red-400" />;
}

export default async function HealthPage() {
  const metrics = await getHealthMetrics();

  const services = [
    { name: 'Database (Supabase)', ok: true, note: 'Connected' },
    { name: 'Failed Payments (24h)', ok: metrics.failedPayments === 0, note: `${metrics.failedPayments} failed` },
    { name: 'Pending Orders', ok: metrics.pendingOrders < 20, note: `${metrics.pendingOrders} pending` },
    { name: 'Active Deliveries', ok: true, note: `${metrics.activeDeliveries} in-flight` },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">System Health</h1>
        <p className="text-gray-400 text-sm mt-0.5">Live metrics — refreshes every 30s</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orgs', value: metrics.totalOrgs, sub: `${metrics.activeOrgs} active licenses` },
          { label: 'Orders Today', value: metrics.ordersToday, sub: `${metrics.ordersWeek} this week` },
          { label: 'Active Deliveries', value: metrics.activeDeliveries, sub: 'Not yet delivered' },
          { label: 'Failed Payments (24h)', value: metrics.failedPayments, sub: 'Stripe failures', alert: metrics.failedPayments > 0 },
        ].map(({ label, value, sub, alert }) => (
          <div key={label} className={`rounded-xl p-4 border ${alert ? 'bg-red-950/30 border-red-800/50' : 'bg-gray-900 border-gray-800'}`}>
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${alert ? 'text-red-400' : 'text-white'}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Service status */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Service Status</h2>
        <div className="space-y-3">
          {services.map(({ name, ok, note }) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon ok={ok} />
                <span className="text-sm text-gray-200">{name}</span>
              </div>
              <span className="text-xs text-gray-400">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Signups</h2>
        {metrics.recentOrgs.length === 0 ? (
          <p className="text-gray-500 text-sm">No organizations yet.</p>
        ) : (
          <ul className="space-y-2">
            {metrics.recentOrgs.map((org: { name: string; created_at: string }) => (
              <li key={org.created_at} className="flex items-center justify-between text-sm">
                <span className="text-gray-200">{org.name}</span>
                <span className="text-gray-500">{new Date(org.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
