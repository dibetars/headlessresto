'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

export default function FinancesPage() {
  const [summary, setSummary] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 8) + '01';

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id, org_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const locId = m?.location_id; if (!locId) return;

    // Revenue summary this month
    const { data: orders } = await supabase.from('orders').select('total_cents, tax_cents, tip_cents')
      .eq('location_id', locId).in('status', ['completed', 'delivered'])
      .gte('created_at', `${monthStart}T00:00:00Z`);

    const rev = (orders || []).reduce((s, o) => s + o.total_cents, 0);
    const tax = (orders || []).reduce((s, o) => s + o.tax_cents, 0);
    const tips = (orders || []).reduce((s, o) => s + (o.tip_cents || 0), 0);
    setSummary({ revenue: rev, tax, tips, orders: orders?.length || 0 });

    // Daily breakdown (last 14 days)
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const { data: dailyOrders } = await supabase.from('orders').select('total_cents, created_at')
      .eq('location_id', locId).in('status', ['completed', 'delivered'])
      .gte('created_at', `${twoWeeksAgo}T00:00:00Z`);

    const byDay: Record<string, number> = {};
    (dailyOrders || []).forEach((o) => {
      const d = o.created_at.split('T')[0];
      byDay[d] = (byDay[d] || 0) + o.total_cents;
    });
    setDaily(Object.entries(byDay).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)));
    setLoading(false);
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;

  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finances</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenue (this month)', value: formatCents(summary?.revenue || 0) },
          { label: 'Orders completed', value: summary?.orders || 0 },
          { label: 'Tax collected', value: formatCents(summary?.tax || 0) },
          { label: 'Tips', value: formatCents(summary?.tips || 0) },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart (bar) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Daily revenue (last 14 days)</h2>
        {daily.length === 0 ? (
          <p className="text-sm text-gray-400">No completed orders yet.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {daily.map(({ date, revenue }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-brand-500 rounded-t opacity-80 group-hover:opacity-100 transition"
                  style={{ height: `${Math.max(4, (revenue / maxRevenue) * 100)}%` }} />
                <span className="text-xs text-gray-400 whitespace-nowrap" style={{ fontSize: 9 }}>
                  {date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
