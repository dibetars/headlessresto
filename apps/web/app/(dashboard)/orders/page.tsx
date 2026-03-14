'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

const STATUSES = ['pending','confirmed','preparing','ready','out_for_delivery','delivered','completed','cancelled'] as const;
type Status = typeof STATUSES[number];

const STATUS_STYLE: Record<Status, string> = {
  pending:          'bg-gray-100 text-gray-600',
  confirmed:        'bg-yellow-100 text-yellow-700',
  preparing:        'bg-blue-100 text-blue-700',
  ready:            'bg-green-100 text-green-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered:        'bg-teal-100 text-teal-700',
  completed:        'bg-gray-100 text-gray-500',
  cancelled:        'bg-red-100 text-red-500',
};

interface Order {
  id: string; status: Status; source: string; customer_name: string | null;
  table_number: string | null; items: any[]; total_cents: number;
  created_at: string; notes: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const locId = m?.location_id; if (!locId) return;
    setLocationId(locId);
    const { data } = await supabase.from('orders').select('*').eq('location_id', locId)
      .order('created_at', { ascending: false }).limit(100);
    setOrders((data || []) as Order[]);
    setLoading(false);

    // Realtime
    supabase.channel('orders-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `location_id=eq.${locId}` },
        (payload) => {
          const row = payload.new as Order;
          setOrders((prev) => {
            const exists = prev.find((o) => o.id === row.id);
            return exists ? prev.map((o) => o.id === row.id ? row : o) : [row, ...prev];
          });
        })
      .subscribe();
  }

  async function updateStatus(orderId: string, status: Status) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap mb-4">
        {(['all', ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
              filter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === 'all' ? `All (${orders.length})` : s.replace('_', ' ')} {s !== 'all' && `(${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.table_number ? `Table ${order.table_number}` : order.customer_name || 'Takeout'}
                    <span className="text-gray-400 font-normal ml-2 text-xs capitalize">{order.source.replace('_', ' ')}</span>
                  </p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-800 text-sm">{formatCents(order.total_cents)}</span>
            </div>

            {expanded === order.id && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                <ul className="text-sm text-gray-700 space-y-1 mb-3">
                  {(order.items as any[]).map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span><span className="font-semibold">{item.quantity}×</span> {item.name}</span>
                      <span className="text-gray-400">{formatCents(item.price_cents * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                {order.notes && <p className="text-xs text-amber-600 mb-3">📝 {order.notes}</p>}
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending' && <ActionBtn label="Confirm" onClick={() => updateStatus(order.id, 'confirmed')} color="yellow" />}
                  {order.status === 'confirmed' && <ActionBtn label="Start preparing" onClick={() => updateStatus(order.id, 'preparing')} color="blue" />}
                  {order.status === 'preparing' && <ActionBtn label="Mark ready" onClick={() => updateStatus(order.id, 'ready')} color="green" />}
                  {order.status === 'ready' && <ActionBtn label="Complete" onClick={() => updateStatus(order.id, 'completed')} color="gray" />}
                  {!['completed','cancelled'].includes(order.status) && (
                    <ActionBtn label="Cancel" onClick={() => updateStatus(order.id, 'cancelled')} color="red" />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && <div className="text-center py-12 text-gray-400">No orders found.</div>}
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, color }: { label: string; onClick: () => void; color: string }) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    blue:   'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green:  'bg-green-100 text-green-700 hover:bg-green-200',
    gray:   'bg-gray-100 text-gray-700 hover:bg-gray-200',
    red:    'bg-red-100 text-red-600 hover:bg-red-200',
  };
  return (
    <button onClick={onClick} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${colors[color]}`}>{label}</button>
  );
}
