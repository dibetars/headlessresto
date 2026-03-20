'use client';

import { updateOrderStatus, getOrders } from '@/actions/orders';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function KDSGrid({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const supabase = createClient();

  const fetchOrders = async () => {
    const allOrders = await getOrders();
    const activeOrders = allOrders.filter(
      (order) => order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
    );
    setOrders(activeOrders);
  };

  // Timer for elapsed time
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // Update every 10s
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt);
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000); // mins
    return diff;
  };

  // Real-time updates for new orders
  useEffect(() => {
    const channel = supabase
      .channel('kds-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus as any);
      setOrders(prev => 
        newStatus === 'completed' || newStatus === 'cancelled'
          ? prev.filter(o => o.id !== id)
          : prev.map(o => o.id === id ? { ...o, status: newStatus } : o)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300">
        <div className="text-4xl mb-2">🍽️</div>
        <h3 className="text-lg font-medium text-gray-900">No active orders</h3>
        <p className="text-gray-500">Orders from the QR menu will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-auto pb-6">
      {orders.map((order) => {
        const elapsedMins = getElapsedTime(order.created_at);
        const isLate = elapsedMins > 15;

        return (
          <div 
            key={order.id} 
            className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden flex flex-col transition-all ${
              order.status === 'pending' ? 'border-blue-500 ring-2 ring-blue-500/20' : 
              order.status === 'preparing' ? 'border-orange-500' :
              'border-green-500'
            }`}
          >
            {/* Header */}
            <div className={`p-3 text-white flex justify-between items-center ${
              order.status === 'pending' ? 'bg-blue-500' : 
              order.status === 'preparing' ? 'bg-orange-500' :
              'bg-green-500'
            }`}>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight uppercase italic">Table {order.table?.table_number || '??'}</span>
                <span className="text-[10px] opacity-80 font-mono">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="text-right">
                <div className={`text-xl font-black ${isLate ? 'text-red-200 animate-pulse' : 'text-white'}`}>
                  {elapsedMins}m
                </div>
                <div className="text-[10px] opacity-80 uppercase font-black">Elapsed</div>
              </div>
            </div>

            {/* Items */}
            <div className="p-4 flex-grow">
              <ul className="space-y-4">
                {order.items?.map((item: any) => (
                  <li key={item.id} className="flex justify-between items-start">
                    <div className="flex items-start">
                      <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 mr-3 border border-slate-200">
                        {item.quantity}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 uppercase tracking-tight leading-tight">{item.menu_item?.name}</span>
                        {/* Optional item modifiers could go here */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="p-3 bg-slate-50 border-t flex space-x-2">
              {order.status === 'pending' ? (
                <button 
                  onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
                >
                  Start Prep
                </button>
              ) : order.status === 'preparing' ? (
                <button 
                  onClick={() => handleStatusUpdate(order.id, 'ready')}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm"
                >
                  Mark Ready
                </button>
              ) : (
                <button 
                  onClick={() => handleStatusUpdate(order.id, 'completed')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-sm"
                >
                  Clear Order
                </button>
              )}
              <button 
                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-xs uppercase hover:bg-rose-100 transition-all border border-rose-100"
                title="Cancel Order"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
