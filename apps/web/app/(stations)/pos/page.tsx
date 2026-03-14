'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { createClient } from '../../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

interface MenuItem { id: string; name: string; category: string; price_cents: number; }
interface CartItem extends MenuItem { quantity: number; }

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tableNum, setTableNum] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setAccessToken(session.access_token);
      const { data: m } = await supabase.from('org_memberships').select('location_id, org_id')
        .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
      const locId = m?.location_id; if (!locId) return;
      setLocationId(locId); setOrgId(m?.org_id);
      const { data } = await supabase.from('menu_items').select('id, name, category, price_cents')
        .eq('location_id', locId).eq('is_available', true).order('category').order('sort_order');
      setMenuItems(data || []);
      if (data?.length) setActiveCategory(data[0].category);
    })();
  }, []);

  const addToCart = (item: MenuItem) =>
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id);
      return ex ? prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
                : [...prev, { ...item, quantity: 1 }];
    });

  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0));

  const subtotal = cart.reduce((s, c) => s + c.price_cents * c.quantity, 0);
  const tax = Math.floor(subtotal * 0.0875);
  const total = subtotal + tax;

  async function placeOrder() {
    if (!cart.length || !locationId) return;
    setPlacing(true);
    try {
      await supabase.from('orders').insert({
        location_id: locationId, source: 'pos', status: 'confirmed',
        items: cart.map((c) => ({ menu_item_id: c.id, name: c.name, quantity: c.quantity, price_cents: c.price_cents })),
        subtotal_cents: subtotal, tax_cents: tax, total_cents: total,
        table_number: tableNum || null, notes: notes || null,
      });
      setCart([]); setTableNum(''); setNotes(''); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally { setPlacing(false); }
  }

  const categories = [...new Set(menuItems.map((i) => i.category))];
  const visibleItems = menuItems.filter((i) => i.category === activeCategory);

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">
      {/* Menu panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat ? 'bg-brand-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {visibleItems.map((item) => (
            <button key={item.id} onClick={() => addToCart(item)}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition active:scale-95">
              <p className="font-semibold text-sm leading-snug">{item.name}</p>
              <p className="text-brand-400 text-sm font-mono mt-2">{formatCents(item.price_cents)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      <div className="w-80 border-l border-gray-800 flex flex-col bg-gray-900">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          <ShoppingCart size={16} className="text-gray-400" />
          <h2 className="font-semibold text-sm">Order</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Table #</label>
              <input value={tableNum} onChange={(e) => setTableNum(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm" placeholder="Optional" />
            </div>
          </div>
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{formatCents(item.price_cents)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded bg-gray-800 hover:bg-gray-700"><Minus size={12} /></button>
                <span className="w-6 text-center text-sm font-mono">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded bg-gray-800 hover:bg-gray-700"><Plus size={12} /></button>
                <button onClick={() => setCart(cart.filter((c) => c.id !== item.id))} className="p-1 rounded hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-8">Tap items to add them</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Notes…" />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span><span>{formatCents(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Tax (8.75%)</span><span>{formatCents(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-white">
            <span>Total</span><span>{formatCents(total)}</span>
          </div>
          {success && <p className="text-center text-xs text-green-400">Order sent to kitchen ✓</p>}
          <button onClick={placeOrder} disabled={placing || cart.length === 0}
            className="w-full bg-brand-600 hover:bg-brand-700 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50">
            {placing ? 'Sending…' : `Place Order · ${formatCents(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
