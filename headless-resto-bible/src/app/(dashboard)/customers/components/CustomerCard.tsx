'use client';

import { Customer } from '@/lib/types';

export default function CustomerCard({ customer }: { customer: any }) {
  const orders = customer.orders || [];
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-900">{customer.name}</h3>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-500">{customer.email}</p>
        <p className="text-sm text-slate-500">{customer.phone}</p>
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Order History</h4>
        {orders.length > 0 ? (
          <ul className="space-y-2">
            {orders.map((order: any) => (
              <li key={order.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">Order #{order.id.slice(0, 8)}</span>
                <span className="text-brand-orange font-bold">${Number(order.total).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400 italic">No orders yet</p>
        )}
      </div>
    </div>
  );
}
