'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { createClient } from '../../../../lib/supabase';

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  reorder_threshold: number | null;
  cost_per_unit_cents: number | null;
}

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [movementItem, setMovementItem] = useState<StockItem | null>(null);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase
      .from('org_memberships').select('location_id').eq('user_id', session.user.id)
      .eq('is_active', true).limit(1).single();
    const locId = m?.location_id;
    if (!locId) return;
    setLocationId(locId);
    const { data } = await supabase.from('stock_items').select('*')
      .eq('location_id', locId).order('name');
    setItems(data || []);
    setLoading(false);
  }

  async function recordMovement(itemId: string, change: number, reason: string) {
    await supabase.from('stock_movements').insert({
      stock_item_id: itemId, location_id: locationId,
      quantity_change: change, reason,
    });
    setItems(items.map((i) => i.id === itemId ? { ...i, quantity: i.quantity + change } : i));
    setMovementItem(null);
  }

  const lowStock = items.filter((i) => i.reorder_threshold != null && i.quantity <= i.reorder_threshold);

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Add item
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Low stock alert</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {lowStock.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <AddStockForm locationId={locationId!} onSave={() => { load(); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}

      {movementItem && (
        <MovementModal item={movementItem} onSave={recordMovement} onClose={() => setMovementItem(null)} />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              {['Item', 'Qty', 'Unit', 'Category', 'Threshold', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const isLow = item.reorder_threshold != null && item.quantity <= item.reorder_threshold;
              return (
                <tr key={item.id} className={isLow ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className={`px-4 py-3 font-mono ${isLow ? 'text-amber-600 font-semibold' : 'text-gray-700'}`}>
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                  <td className="px-4 py-3 text-gray-400">{item.category || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{item.reorder_threshold ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setMovementItem(item)}
                      className="text-xs text-brand-600 hover:underline">Record movement</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">No stock items yet.</div>
        )}
      </div>
    </div>
  );
}

function AddStockForm({ locationId, onSave, onCancel }: { locationId: string; onSave: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('units');
  const [qty, setQty] = useState('0');
  const [threshold, setThreshold] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from('stock_items').insert({
      location_id: locationId, name, unit,
      quantity: parseFloat(qty), reorder_threshold: threshold ? parseFloat(threshold) : null,
      category: category || null,
    });
    onSave();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="font-semibold text-gray-800 mb-4">New stock item</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Unit *</label>
          <input required value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="kg, lbs, units…" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Starting qty</label>
          <input type="number" step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Reorder threshold</label>
          <input type="number" step="0.01" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Produce, Proteins…" /></div>
        <div className="col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Add item'}
          </button>
        </div>
      </form>
    </div>
  );
}

function MovementModal({ item, onSave, onClose }: {
  item: StockItem; onSave: (id: string, change: number, reason: string) => void; onClose: () => void;
}) {
  const [change, setChange] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-semibold text-gray-800 mb-1">Record movement</h3>
        <p className="text-sm text-gray-500 mb-4">{item.name} — current: {item.quantity} {item.unit}</p>
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Change (negative = used, positive = restocked)</label>
            <input type="number" step="0.01" value={change} onChange={(e) => setChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="-2.5 or +10" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="order_123, restock, waste…" /></div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(item.id, parseFloat(change), reason)}
            disabled={!change || !reason}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50">
            Record
          </button>
        </div>
      </div>
    </div>
  );
}
