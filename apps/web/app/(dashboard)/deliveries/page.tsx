'use client';

import { useState, useEffect } from 'react';
import { Truck, ExternalLink } from 'lucide-react';
import { createClient } from '../../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

const STATUS_STYLE: Record<string, string> = {
  pending:         'bg-gray-100 text-gray-600',
  driver_assigned: 'bg-yellow-100 text-yellow-700',
  picked_up:       'bg-blue-100 text-blue-700',
  in_transit:      'bg-purple-100 text-purple-700',
  delivered:       'bg-green-100 text-green-700',
  cancelled:       'bg-red-100 text-red-500',
  failed:          'bg-red-100 text-red-500',
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [dropoffAddr, setDropoffAddr] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const locId = m?.location_id; if (!locId) return;

    const { data } = await supabase.from('deliveries')
      .select('*, orders!inner(id, customer_name, customer_phone, total_cents, location_id)')
      .eq('orders.location_id', locId)
      .order('created_at', { ascending: false }).limit(50);

    setDeliveries(data || []);
    setLoading(false);
  }

  async function dispatch(orderId: string) {
    const addr = dropoffAddr[orderId];
    if (!addr) return alert('Enter a dropoff address first');
    setDispatching(orderId);
    const { data: { session } } = await supabase.auth.getSession();
    const { data: m } = await supabase.from('org_memberships').select('org_id, location_id')
      .eq('user_id', session!.user.id).eq('is_active', true).limit(1).single();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/deliveries/${orderId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session!.access_token}`, 'x-organization-id': m!.org_id, 'x-location-id': m!.location_id },
        body: JSON.stringify({ dropoff_address: addr }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setDispatching(null); }
  }

  // Orders that are 'ready' but have no delivery yet
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: m } = await supabase.from('org_memberships').select('location_id')
        .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
      if (!m?.location_id) return;
      const { data } = await supabase.from('orders').select('*')
        .eq('location_id', m.location_id).eq('status', 'ready').is('source', null).order('created_at');
      // Actually get delivery_platform + ready orders without a delivery
      const { data: allReady } = await supabase.from('orders')
        .select('id, customer_name, total_cents, items').eq('location_id', m.location_id)
        .eq('status', 'ready').order('created_at');
      setReadyOrders(allReady || []);
    })();
  }, [deliveries]);

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Truck size={24} className="text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
      </div>

      {readyOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ready to dispatch</h2>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{order.customer_name || 'Customer'}</p>
                  <p className="text-xs text-gray-400">{formatCents(order.total_cents)}</p>
                </div>
                <input value={dropoffAddr[order.id] || ''} onChange={(e) => setDropoffAddr({ ...dropoffAddr, [order.id]: e.target.value })}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Dropoff address" />
                <button onClick={() => dispatch(order.id)} disabled={dispatching === order.id}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {dispatching === order.id ? 'Dispatching…' : 'Dispatch'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active deliveries</h2>
      <div className="space-y-2">
        {deliveries.filter((d) => !['delivered','cancelled','failed'].includes(d.status)).map((d) => (
          <div key={d.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{(d.orders as any)?.customer_name || 'Customer'}</p>
              <p className="text-xs text-gray-400 mt-0.5">To: {d.dropoff_address}</p>
              {d.driver_name && <p className="text-xs text-gray-400">Driver: {d.driver_name} {d.driver_phone}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[d.status]}`}>
                {d.status.replace('_', ' ')}
              </span>
              {d.tracking_url && (
                <a href={d.tracking_url} target="_blank" rel="noreferrer"
                  className="text-brand-600 hover:text-brand-700"><ExternalLink size={15} /></a>
              )}
            </div>
          </div>
        ))}
        {deliveries.filter((d) => !['delivered','cancelled','failed'].includes(d.status)).length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No active deliveries.</div>
        )}
      </div>
    </div>
  );
}
