'use client'

import { useState, useEffect } from 'react'
import { BoldTemplate } from '@/components/menu-templates/BoldTemplate'
import { MinimalTemplate } from '@/components/menu-templates/MinimalTemplate'
import { WarmTemplate } from '@/components/menu-templates/WarmTemplate'
import { ChevronRight, ArrowLeft, Check, MapPin, Phone, User, Clock, Truck, Star } from 'lucide-react'
import { DeliveryMap } from '@/components/DeliveryMap'

type Template = 'bold' | 'minimal' | 'warm'
type FlowStep = 'browse' | 'checkout' | 'track'

interface CartItem { id: string; name: string; price: number; quantity: number }

const TEMPLATE_CONFIG = {
  bold: {
    label: 'Bold', emoji: '🔥', desc: 'Dark • FoodHub-style',
    primary: '#FF6B00',
    restaurant: { name: 'The Bold Kitchen', slug: 'demo', brand_assets: { primary_color: '#FF6B00', template: 'bold' } },
  },
  minimal: {
    label: 'Minimal', emoji: '🌿', desc: 'Clean • DeliDrop-style',
    primary: '#16a34a',
    restaurant: { name: 'The Fresh Table', slug: 'demo', brand_assets: { primary_color: '#16a34a', template: 'minimal' } },
  },
  warm: {
    label: 'Warm', emoji: '🌄', desc: 'Earthy • Anda-style',
    primary: '#4a8c2a',
    restaurant: { name: 'The Garden Bistro', slug: 'demo', brand_assets: { primary_color: '#4a8c2a', template: 'warm' } },
  },
} as const

const MOCK_ITEMS = [
  { id: '1', name: 'Classic Burger', description: '6oz beef patty, lettuce, tomato, pickle, house sauce', price: 13.99, category: 'Burgers', image_url: null },
  { id: '2', name: 'Mushroom Swiss Burger', description: '6oz beef patty, sautéed mushrooms, Swiss cheese', price: 15.99, category: 'Burgers', image_url: null },
  { id: '3', name: 'BBQ Bacon Burger', description: 'Crispy bacon, cheddar, smoky BBQ sauce', price: 17.99, category: 'Burgers', image_url: null },
  { id: '4', name: 'Margherita Pizza', description: 'San Marzano tomato, buffalo mozzarella, fresh basil', price: 18.99, category: 'Pizza', image_url: null },
  { id: '5', name: 'BBQ Chicken Pizza', description: 'Smoky BBQ, grilled chicken, red onion, cilantro', price: 21.99, category: 'Pizza', image_url: null },
  { id: '6', name: 'Caesar Salad', description: 'Romaine hearts, parmesan, croutons, Caesar dressing', price: 11.99, category: 'Salads', image_url: null },
  { id: '7', name: 'Greek Salad', description: 'Cucumber, olives, feta, cherry tomatoes, oregano', price: 13.99, category: 'Salads', image_url: null },
  { id: '8', name: 'Crispy Wings', description: '8 wings: buffalo, BBQ, or honey garlic', price: 14.99, category: 'Starters', image_url: null },
  { id: '9', name: 'Loaded Nachos', description: 'Tortilla chips, cheese sauce, jalapeños, sour cream', price: 12.99, category: 'Starters', image_url: null },
  { id: '10', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with vanilla ice cream', price: 9.99, category: 'Desserts', image_url: null },
  { id: '11', name: 'Fresh Lemonade', description: 'Freshly squeezed, mint, served over ice', price: 4.99, category: 'Drinks', image_url: null },
  { id: '12', name: 'Craft Cola', description: 'House-made cola with vanilla and spice', price: 3.99, category: 'Drinks', image_url: null },
]
const MOCK_CATEGORIES = ['Burgers', 'Pizza', 'Salads', 'Starters', 'Desserts', 'Drinks']

/* ─── Demo Chrome ─────────────────────────────────────────────── */
function DemoChrome({ activeTemplate, onTemplateChange, step }: {
  activeTemplate: Template
  onTemplateChange: (t: Template) => void
  step: FlowStep
}) {
  const steps: { key: FlowStep; label: string }[] = [
    { key: 'browse', label: '1. Browse' },
    { key: 'checkout', label: '2. Checkout' },
    { key: 'track', label: '3. Track' },
  ]
  const primaryColor = TEMPLATE_CONFIG[activeTemplate].primary

  return (
    <>
      <style>{`
        .demo-subtitle { display: flex; }
        .demo-flow { display: flex; }
        .demo-tab-label { display: inline; }
        @media (max-width: 640px) {
          .demo-subtitle { display: none !important; }
          .demo-flow { display: none !important; }
          .demo-tab-label { display: none !important; }
        }
      `}</style>
      <div style={{
        background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 16px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        flexShrink: 0,
      }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ background: primaryColor, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: 1, textTransform: 'uppercase' as const }}>DEMO</div>
        <span className="demo-subtitle" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' as const }}>HeadlessResto · Template Preview</span>
      </div>

      {/* Template switcher */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
        {(Object.entries(TEMPLATE_CONFIG) as [Template, typeof TEMPLATE_CONFIG[Template]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => onTemplateChange(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 7, border: 'none',
              background: activeTemplate === key ? primaryColor : 'transparent',
              color: activeTemplate === key ? '#fff' : 'rgba(255,255,255,0.45)',
              fontWeight: activeTemplate === key ? 700 : 500,
              fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
            <span className="demo-tab-label">{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Flow steps */}
      <div className="demo-flow" style={{ alignItems: 'center', gap: 4 }}>
        {steps.map((s, i) => {
          const isActive = s.key === step
          const isDone = steps.findIndex(x => x.key === step) > i
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 999,
                background: isDone ? '#22c55e22' : isActive ? `${primaryColor}22` : 'transparent',
                border: `1px solid ${isDone ? '#22c55e55' : isActive ? `${primaryColor}55` : 'rgba(255,255,255,0.1)'}`,
              }}>
                {isDone
                  ? <Check size={11} color="#22c55e" />
                  : <span style={{ width: 6, height: 6, borderRadius: 999, background: isActive ? primaryColor : 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                }
                <span style={{ fontSize: 12, fontWeight: 600, color: isDone ? '#22c55e' : isActive ? primaryColor : 'rgba(255,255,255,0.35)' }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>›</span>}
            </div>
          )
        })}
      </div>
    </div>
    </>
  )
}

/* ─── Checkout Step ───────────────────────────────────────────── */
function DemoCheckout({ cart, restaurant, primaryColor, onBack, onPlace }: {
  cart: CartItem[]; restaurant: typeof TEMPLATE_CONFIG[Template]['restaurant']
  primaryColor: string; onBack: () => void; onPlaceOrder?: () => void; onPlace: () => void
}) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const fee = 3.99
  const tax = subtotal * 0.1
  const total = subtotal + fee + tax
  const [placing, setPlacing] = useState(false)

  const handlePlace = () => {
    setPlacing(true)
    setTimeout(() => {
      setPlacing(false)
      // Broadcast to dashboard demo tab
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const orderId = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase()
        const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
        const order = {
          id: orderId, customerName: 'Jane Demo',
          address: '123 Demo Street, Apt 4B, San Francisco, CA 94105',
          items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
          total: parseFloat((subtotal * 1.1 + 3.99).toFixed(2)),
          timestamp: new Date().toISOString(), status: 'pending', source: 'customer',
        }
        try {
          const existing = JSON.parse(localStorage.getItem('headlessresto_demo_orders') || '[]')
          localStorage.setItem('headlessresto_demo_orders', JSON.stringify([...existing, order].slice(-50)))
        } catch {}
        try {
          const ch = new BroadcastChannel('headlessresto_demo')
          ch.postMessage({ type: 'NEW_ORDER', order })
          ch.close()
        } catch {}
      }
      onPlace()
    }, 1600)
  }

  return (
    <div style={{ background: '#f8f8f8', minHeight: 'calc(100vh - 56px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 28, padding: 0 }}>
          <ArrowLeft size={16} /> Back to menu
        </button>

        <h2 style={{ margin: '0 0 32px', fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: -0.5 }}>Checkout</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) min(380px, 100%)', gap: 24, alignItems: 'start' }}>
          {/* Left: form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer details */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#111' }}>👤 Your Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Full Name', icon: <User size={14} />, value: 'Jane Demo', placeholder: 'Jane Smith' },
                  { label: 'Phone', icon: <Phone size={14} />, value: '(555) 010-0100', placeholder: '(555) 000-0000' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px' }}>
                      <span style={{ color: '#9ca3af' }}>{f.icon}</span>
                      <span style={{ fontSize: 14, color: '#374151' }}>{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#111' }}>📍 Delivery Address</h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                <MapPin size={16} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>123 Demo Street, Apt 4B, San Francisco, CA 94105</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                <Clock size={14} color="#16a34a" />
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Estimated delivery: 25–35 minutes</span>
              </div>
            </div>

            {/* Payment */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#111' }}>💳 Payment</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#f9fafb', borderRadius: 10, border: '1.5px solid #e5e7eb' }}>
                <span style={{ fontSize: 22 }}>💳</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111' }}>Visa ending in 4242</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Demo card — no real charge</p>
                </div>
                <div style={{ marginLeft: 'auto', background: '#f0fdf4', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#16a34a' }}>DEMO</div>
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 16 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#111' }}>🛒 Order Summary</h3>
            <div style={{ marginBottom: 20 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>×{item.quantity}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[{ label: 'Subtotal', value: `$${subtotal.toFixed(2)}` }, { label: 'Delivery fee', value: `$${fee.toFixed(2)}` }, { label: 'Tax (10%)', value: `$${tax.toFixed(2)}` }].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
                  <span>{r.label}</span><span>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 900, color: '#111', marginBottom: 24, paddingTop: 16, borderTop: '2px solid #f5f5f5' }}>
              <span>Total</span>
              <span style={{ color: primaryColor }}>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlace}
              disabled={placing}
              style={{
                width: '100%', padding: '16px', background: placing ? '#9ca3af' : primaryColor,
                color: '#fff', border: 'none', borderRadius: 14,
                fontWeight: 900, fontSize: 16, cursor: placing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {placing ? '⏳ Placing order...' : <>Place Demo Order <ChevronRight size={18} /></>}
            </button>
            <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 11, margin: '12px 0 0' }}>Demo mode — no real order placed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Tracking Step ───────────────────────────────────────────── */
function DemoTrack({ cart, restaurant, primaryColor, onReset }: {
  cart: CartItem[]; restaurant: typeof TEMPLATE_CONFIG[Template]['restaurant']
  primaryColor: string; onReset: () => void
}) {
  const [trackStep, setTrackStep] = useState(0)
  const [orderId] = useState(() => 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase())
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0) * 1.13 + 3.99

  // Only advances when the restaurant updates status in the dashboard
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return
    const STATUS_TO_STEP: Record<string, number> = { pending: 0, preparing: 1, ready: 2, delivered: 4 }
    const ch = new BroadcastChannel('headlessresto_demo')
    ch.onmessage = (event: MessageEvent) => {
      const { type, status } = event.data ?? {}
      if (type === 'ORDER_STATUS' && status && STATUS_TO_STEP[status] !== undefined) {
        setTrackStep(prev => Math.max(prev, STATUS_TO_STEP[status]))
      }
    }
    return () => ch.close()
  }, [])

  const kitchenSteps = [
    { label: 'Order Received', icon: '✅', desc: 'Your order has been confirmed' },
    { label: 'Preparing', icon: '👨‍🍳', desc: 'Kitchen is preparing your order' },
    { label: 'Ready for Pickup', icon: '📦', desc: 'Packed and ready for the driver' },
    { label: 'Out for Delivery', icon: '🚗', desc: 'Driver is on the way to you' },
    { label: 'Delivered!', icon: '🎉', desc: 'Enjoy your meal!' },
  ]

  return (
    <div style={{ background: '#f8f8f8', minHeight: 'calc(100vh - 56px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Success banner */}
        <div style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
          borderRadius: 20, padding: '28px 32px', marginBottom: 32,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>Order confirmed</p>
            <h2 style={{ margin: '0 0 4px', color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>#{orderId}</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
              {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''} · ${total.toFixed(2)} · Est. 25–35 min
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 48 }}>🛵</div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#111' }}>Order Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {kitchenSteps.map((s, i) => {
              const isDone = i < trackStep
              const isActive = i === trackStep
              return (
                <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < kitchenSteps.length - 1 ? 20 : 0 }}>
                  {/* Connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                      background: isDone ? primaryColor : isActive ? `${primaryColor}22` : '#f3f4f6',
                      border: `2px solid ${isDone ? primaryColor : isActive ? primaryColor : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isDone ? 14 : 16,
                      transition: 'all 0.4s',
                    }}>
                      {isDone ? <Check size={16} color="#fff" /> : <span style={{ opacity: isActive ? 1 : 0.4 }}>{s.icon}</span>}
                    </div>
                    {i < kitchenSteps.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 20, background: isDone ? primaryColor : '#e5e7eb', transition: 'background 0.4s', margin: '4px 0' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ paddingTop: 6, paddingBottom: 8 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: isActive ? 800 : isDone ? 700 : 500, color: isDone || isActive ? '#111' : '#9ca3af', transition: 'all 0.3s' }}>
                      {s.label}
                      {isActive && <span style={{ marginLeft: 8, fontSize: 11, background: `${primaryColor}22`, color: primaryColor, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>NOW</span>}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: isDone || isActive ? '#6b7280' : '#d1d5db' }}>{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Delivery Map */}
        <div style={{ marginBottom: 24 }}>
          <DeliveryMap mode="demo" step={trackStep} primaryColor={primaryColor} />
        </div>

        {/* Driver card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: `${primaryColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🧑</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 16, color: '#111' }}>Marcus R.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>4.97</span>
                <span style={{ color: '#d1d5db', fontSize: 13 }}>·</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Toyota Prius · KGT 4821</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: 18 }}>📞</button>
              <button style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: 18 }}>💬</button>
            </div>
          </div>
        </div>

        {/* Items recap */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 32, boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111' }}>Your Order</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
              <span style={{ color: '#374151' }}>{item.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span></span>
              <span style={{ fontWeight: 700, color: '#111' }}>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto',
            background: 'none', border: `2px solid ${primaryColor}`,
            color: primaryColor, borderRadius: 12, padding: '12px 28px',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Try another theme
        </button>
      </div>
    </div>
  )
}

/* ─── Main Demo Page ──────────────────────────────────────────── */
export default function DemoPage() {
  const [template, setTemplate] = useState<Template>('bold')
  const [step, setStep] = useState<FlowStep>('browse')
  const [cart, setCart] = useState<CartItem[]>([])
  const [availability, setAvailability] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return
    const ch = new BroadcastChannel('headlessresto_demo')
    ch.onmessage = ({ data }) => {
      if (data.type === 'ITEM_UNAVAILABLE' && data.itemId)
        setAvailability(prev => ({ ...prev, [data.itemId]: false }))
      if (data.type === 'ITEM_AVAILABLE' && data.itemId)
        setAvailability(prev => ({ ...prev, [data.itemId]: true }))
    }
    return () => ch.close()
  }, [])

  const cfg = TEMPLATE_CONFIG[template]
  const TemplateComponent = template === 'bold' ? BoldTemplate : template === 'minimal' ? MinimalTemplate : WarmTemplate

  const handleCheckout = (cartItems: { id: string; name: string; price: number; quantity: number }[]) => {
    setCart(cartItems)
    setStep('checkout')
  }

  const handleTemplateChange = (t: Template) => {
    setTemplate(t)
    setStep('browse')
    setCart([])
  }

  return (
    <div suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      <DemoChrome activeTemplate={template} onTemplateChange={handleTemplateChange} step={step} />

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {step === 'browse' && (
          <TemplateComponent
            restaurant={cfg.restaurant}
            menuItems={MOCK_ITEMS}
            categories={MOCK_CATEGORIES}
            onCheckout={handleCheckout}
            availability={availability}
          />
        )}
        {step === 'checkout' && (
          <DemoCheckout
            cart={cart}
            restaurant={cfg.restaurant}
            primaryColor={cfg.primary}
            onBack={() => setStep('browse')}
            onPlace={() => setStep('track')}
          />
        )}
        {step === 'track' && (
          <DemoTrack
            cart={cart}
            restaurant={cfg.restaurant}
            primaryColor={cfg.primary}
            onReset={() => { setStep('browse'); setCart([]) }}
          />
        )}
      </div>
    </div>
  )
}
