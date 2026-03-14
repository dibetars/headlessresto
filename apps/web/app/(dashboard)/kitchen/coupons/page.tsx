'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { createClient } from '../../../../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

interface Coupon {
  id: string; code: string; type: string; value: number;
  min_order_cents: number; max_uses: number | null; current_uses: number;
  valid_from: string; valid_until: string; is_active: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const locId = m?.location_id; if (!locId) return;
    setLocationId(locId);
    const { data } = await supabase.from('coupons').select('*').eq('location_id', locId).order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }

  async function toggleActive(coupon: Coupon) {
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id);
    setCoupons(coupons.map((c) => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
  }

  const formatValue = (coupon: Coupon) =>
    coupon.type === 'percentage' ? `${coupon.value}% off` :
    coupon.type === 'fixed_amount' ? `${formatCents(coupon.value * 100)} off` : 'Buy X Get Y';

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> New coupon
        </button>
      </div>

      {showForm && (
        <CouponForm locationId={locationId!} onSave={() => { load(); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {coupons.map((coupon) => {
          const expired = new Date(coupon.valid_until) < new Date();
          return (
            <div key={coupon.id} className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg"><Tag size={14} className="text-gray-500" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-900 text-sm">{coupon.code}</span>
                    {expired && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Expired</span>}
                    {!coupon.is_active && !expired && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatValue(coupon)} · {coupon.current_uses}/{coupon.max_uses ?? '∞'} uses ·
                    Min order {formatCents(coupon.min_order_cents)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">until {coupon.valid_until.split('T')[0]}</span>
                <button onClick={() => toggleActive(coupon)}
                  className={`text-xs px-3 py-1 rounded-full transition ${coupon.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">No coupons yet. Create one to offer discounts.</div>
        )}
      </div>
    </div>
  );
}

function CouponForm({ locationId, onSave, onCancel }: { locationId: string; onSave: () => void; onCancel: () => void }) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await supabase.from('coupons').insert({
      location_id: locationId,
      code: code.toUpperCase(), type, value: parseFloat(value),
      min_order_cents: Math.round(parseFloat(minOrder) * 100),
      max_uses: maxUses ? parseInt(maxUses) : null,
      valid_from: new Date(validFrom).toISOString(),
      valid_until: new Date(validUntil + 'T23:59:59').toISOString(),
    });
    onSave();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="font-semibold text-gray-800 mb-4">New coupon</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Code *</label>
          <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="SAVE20" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="percentage">Percentage off</option>
            <option value="fixed_amount">Fixed amount off</option>
          </select></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">{type === 'percentage' ? 'Percent (%)' : 'Amount ($)'} *</label>
          <input required type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Min order ($)</label>
          <input type="number" step="0.01" value={minOrder} onChange={(e) => setMinOrder(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Max uses (blank = unlimited)</label>
          <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        <div className="grid grid-cols-2 gap-2 col-span-2">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Valid from *</label>
            <input required type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Valid until *</label>
            <input required type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div className="col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Create coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
