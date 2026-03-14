'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Send } from 'lucide-react';
import { createClient } from '../../../../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

interface MenuItem { id: string; name: string; category: string; price_cents: number; is_available: boolean; }
interface DailyMenu { id: string; item_ids: string[]; specials: any[]; is_published: boolean; published_at: string | null; }

export default function DailyMenuPage() {
  const today = new Date().toISOString().split('T')[0];
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const locId = m?.location_id;
    if (!locId) return;
    setLocationId(locId);

    const [{ data: items }, { data: daily }] = await Promise.all([
      supabase.from('menu_items').select('*').eq('location_id', locId).eq('is_available', true).order('category').order('sort_order'),
      supabase.from('daily_menus').select('*').eq('location_id', locId).eq('menu_date', today).maybeSingle(),
    ]);

    setAllItems(items || []);
    if (daily) {
      setMenu(daily);
      setSelected(new Set(daily.item_ids));
    }
    setLoading(false);
  }

  async function saveMenu() {
    setSaving(true);
    const itemIds = Array.from(selected);
    const { data, error } = await supabase.from('daily_menus')
      .upsert({ location_id: locationId, menu_date: today, item_ids: itemIds, specials: menu?.specials || [] })
      .select().single();
    if (!error) setMenu(data);
    setSaving(false);
  }

  async function publish() {
    if (!menu) return;
    setSaving(true);
    const { data } = await supabase.from('daily_menus')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', menu.id).select().single();
    if (data) setMenu(data);
    setSaving(false);
  }

  const toggle = (id: string) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const byCategory = allItems.reduce((acc: Record<string, MenuItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Menu</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {menu?.is_published ? (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Published
            </span>
          ) : (
            <>
              <button onClick={saveMenu} disabled={saving} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save draft'}
              </button>
              <button onClick={publish} disabled={saving || !menu || selected.size === 0}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                <Send size={14} /> Publish
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{category}</h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {items.map((item) => {
                  const on = selected.has(item.id);
                  return (
                    <label key={item.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${on ? 'bg-brand-50' : ''}`}>
                      {on ? <CheckCircle2 size={18} className="text-brand-600 shrink-0" /> : <Circle size={18} className="text-gray-300 shrink-0" />}
                      <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(item.id)} />
                      <span className="flex-1 text-sm font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm text-gray-500">{formatCents(item.price_cents)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit sticky top-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Summary</h3>
          <p className="text-3xl font-bold text-gray-900">{selected.size}</p>
          <p className="text-xs text-gray-400 mt-0.5">items selected</p>
          <div className="mt-4 space-y-1">
            {Array.from(selected).map((id) => {
              const item = allItems.find((i) => i.id === id);
              return item ? <p key={id} className="text-xs text-gray-500 truncate">· {item.name}</p> : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
