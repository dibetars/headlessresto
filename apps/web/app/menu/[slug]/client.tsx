'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { formatCents } from '@restaurantos/shared';

interface MenuItem { id: string; name: string; description: string | null; category: string; price_cents: number; allergens: string[]; prep_time_minutes: number | null; }
interface CartItem extends MenuItem { quantity: number; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function QRMenuClient({ org, location, items, specials, tableNumber }: {
  org: any; location: any; items: MenuItem[]; specials: any[]; tableNumber?: string;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [step, setStep] = useState<'menu' | 'checkout' | 'paying' | 'done'>('menu');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  const addToCart = (item: MenuItem) =>
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id);
      return ex ? prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) : [...prev, { ...item, quantity: 1 }];
    });

  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0));

  const subtotal = cart.reduce((s, c) => s + c.price_cents * c.quantity, 0);
  const byCategory = items.reduce((acc: Record<string, MenuItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  async function placeOrder() {
    setError('');
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'qr_menu',
          items: cart.map((c) => ({ menu_item_id: c.id, quantity: c.quantity })),
          customer_name: customerName,
          customer_phone: customerPhone || undefined,
          table_number: tableNumber || undefined,
          coupon_code: couponCode || undefined,
          notes: notes || undefined,
          tip_cents: 0,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      const order = await res.json();
      setOrderId(order.id);
      setStep('paying');

      // Get payment intent
      const piRes = await fetch(`${API_URL}/payments/orders/${order.id}/intent`, { method: 'POST' });
      if (!piRes.ok) throw new Error('Could not create payment');

      // In production, mount Stripe Elements here using clientSecret
      // For now, mark as done (demo mode)
      setStep('done');
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h1>
          <p className="text-gray-500">We'll have it ready shortly{tableNumber ? ` at table ${tableNumber}` : ''}.</p>
          <button onClick={() => { setCart([]); setStep('menu'); setCustomerName(''); setCustomerPhone(''); }}
            className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium">
            Order more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">{org.name}</h1>
            {tableNumber && <p className="text-xs text-gray-400">Table {tableNumber}</p>}
          </div>
          <button onClick={() => setShowCart(true)} className="relative p-2">
            <ShoppingCart size={22} className="text-gray-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {step === 'menu' && (
        <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
          {Object.entries(byCategory).map(([category, catItems]) => (
            <div key={category}>
              <h2 className="font-bold text-gray-800 mb-3">{category}</h2>
              <div className="space-y-3">
                {catItems.map((item) => {
                  const inCart = cart.find((c) => c.id === item.id);
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                        {item.allergens?.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">Contains: {item.allergens.join(', ')}</p>
                        )}
                        <p className="font-semibold text-brand-600 text-sm mt-1.5">{formatCents(item.price_cents)}</p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center"><Minus size={12} /></button>
                          <span className="text-sm font-semibold w-4 text-center">{inCart.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center"><Plus size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0"><Plus size={16} /></button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </main>
      )}

      {step === 'checkout' && (
        <main className="max-w-lg mx-auto px-4 py-6">
          <button onClick={() => setStep('menu')} className="text-sm text-brand-600 mb-4">← Back to menu</button>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your details</h2>
          <div className="space-y-3 bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone (optional)</label>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Coupon code</label>
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="SAVE20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Special requests</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button onClick={placeOrder} disabled={!customerName || cart.length === 0}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
            Place Order · {formatCents(subtotal)}
          </button>
        </main>
      )}

      {/* Cart sheet */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Your order</h2>
              <button onClick={() => setShowCart(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="px-4 py-3 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-gray-400">{formatCents(item.price_cents)} each</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={12} /></button>
                    <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex justify-between font-bold text-gray-900 mb-3">
                <span>Subtotal</span><span>{formatCents(subtotal)}</span>
              </div>
              <button onClick={() => { setShowCart(false); setStep('checkout'); }}
                disabled={cart.length === 0}
                className="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
                Checkout · {formatCents(subtotal)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
