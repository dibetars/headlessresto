'use client';

import { Order } from '@/lib/types';
import { updateOrderStatus } from '@/actions/orders';
import { useState } from 'react';

export default function OrderCard({ order }: { order: any }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    try {
      await updateOrderStatus(order.id, status as any);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Header */}
      <div className={`p-6 flex items-center justify-between ${
        order.status === 'pending' ? 'bg-amber-50/50' : 
        order.status === 'in-progress' ? 'bg-blue-50/50' : 
        order.status === 'completed' ? 'bg-emerald-50/50' : 
        'bg-slate-50/50'
      }`}>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">
            Table <span className="text-brand-orange">{order.table?.table_number || '??'}</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest font-mono">
            #{order.id.slice(0, 8)}
          </p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
          {
            'pending': 'bg-amber-100 text-amber-600',
            'in-progress': 'bg-blue-100 text-blue-600',
            'completed': 'bg-emerald-100 text-emerald-600',
            'cancelled': 'bg-rose-100 text-rose-600',
          }[order.status as string] || 'bg-slate-100 text-slate-600'
        }`}>
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="p-8">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Order Items</p>
          <ul className="space-y-3">
            {order.items?.map((item: any) => (
              <li key={item.id} className="flex justify-between items-center text-sm group/item">
                <span className="font-bold text-slate-700 group-hover/item:text-brand-blue transition-colors">
                  <span className="text-brand-orange mr-2">{item.quantity}x</span>
                  {item.menu_item?.name || 'Item'}
                </span>
                <span className="font-black text-slate-900">${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
              <p className="text-2xl font-black text-brand-blue tracking-tight italic">${Number(order.total).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            {order.status === 'pending' && (
              <button 
                onClick={() => handleStatusChange('in-progress')} 
                disabled={loading}
                className="flex-1 py-4 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Start Cooking'}
              </button>
            )}
            {order.status === 'in-progress' && (
              <button 
                onClick={() => handleStatusChange('completed')} 
                disabled={loading}
                className="flex-1 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Complete Order'}
              </button>
            )}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <button 
                onClick={() => handleStatusChange('cancelled')} 
                disabled={loading}
                className="px-6 py-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
