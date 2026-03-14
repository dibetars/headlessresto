'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

type OrderStatus = 'confirmed' | 'preparing' | 'ready';

interface Order {
  id: string; status: OrderStatus; source: string; customer_name: string | null;
  table_number: string | null; items: { name: string; quantity: number; price_cents: number }[];
  total_cents: number; created_at: string; notes: string | null;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  confirmed: 'border-yellow-400 bg-yellow-950/30',
  preparing: 'border-blue-400 bg-blue-950/30',
  ready:     'border-green-400 bg-green-950/30',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'New', preparing: 'Preparing', ready: 'Ready',
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | 'completed'> = {
  confirmed: 'preparing', preparing: 'ready', ready: 'completed',
};

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: m } = await supabase.from('org_memberships').select('location_id')
        .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
      const locId = m?.location_id; if (!locId) return;
      setLocationId(locId);

      // Initial load
      const { data } = await supabase.from('orders').select('*')
        .eq('location_id', locId)
        .in('status', ['confirmed', 'preparing', 'ready'])
        .order('created_at');
      setOrders((data || []) as Order[]);

      // Subscribe to realtime updates
      supabase.channel('kds-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `location_id=eq.${locId}` },
          (payload) => {
            const row = payload.new as Order;
            if (['confirmed', 'preparing', 'ready'].includes(row.status)) {
              setOrders((prev) => {
                const exists = prev.find((o) => o.id === row.id);
                return exists ? prev.map((o) => o.id === row.id ? row : o) : [...prev, row];
              });
            } else {
              // Completed / cancelled — remove from board
              setOrders((prev) => prev.filter((o) => o.id !== (payload.new as any).id));
            }
          })
        .subscribe();
    })();
  }, []);

  async function advance(order: Order) {
    const next = NEXT_STATUS[order.status];
    await supabase.from('orders').update({ status: next, updated_at: new Date().toISOString() }).eq('id', order.id);
    if (next === 'completed') {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } else {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next as OrderStatus } : o));
    }
  }

  const cols: Record<OrderStatus, Order[]> = {
    confirmed: orders.filter((o) => o.status === 'confirmed'),
    preparing: orders.filter((o) => o.status === 'preparing'),
    ready:     orders.filter((o) => o.status === 'ready'),
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <header className="px-6 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-lg tracking-wide">Kitchen Display</h1>
        <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
      </header>
      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
        {(['confirmed', 'preparing', 'ready'] as OrderStatus[]).map((status) => (
          <div key={status} className="flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center gap-2 shrink-0">
              <span className={`w-2 h-2 rounded-full ${status === 'confirmed' ? 'bg-yellow-400' : status === 'preparing' ? 'bg-blue-400' : 'bg-green-400'}`} />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {STATUS_LABELS[status]} ({cols[status].length})
              </h2>
            </div>
            {cols[status].map((order) => (
              <div key={order.id} className={`rounded-xl border-l-4 p-4 ${STATUS_COLORS[status]}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">
                      {order.table_number ? `Table ${order.table_number}` : order.customer_name || 'Takeout'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{order.source.replace('_', ' ')}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <ul className="space-y-1 mb-3">
                  {(order.items as any[]).map((item, i) => (
                    <li key={i} className="text-sm flex justify-between">
                      <span><span className="font-bold text-white mr-1.5">{item.quantity}×</span>{item.name}</span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <p className="text-xs text-amber-300 bg-amber-950/50 rounded px-2 py-1 mb-3">📝 {order.notes}</p>
                )}
                <button onClick={() => advance(order)}
                  className={`w-full text-xs font-semibold py-2 rounded-lg transition ${
                    status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
                    status === 'preparing' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-gray-600 hover:bg-gray-700'
                  }`}>
                  {status === 'confirmed' ? 'Start preparing →' : status === 'preparing' ? 'Mark ready →' : 'Complete ✓'}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
