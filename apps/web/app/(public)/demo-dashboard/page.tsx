'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Clock, ShoppingBag, TrendingUp, Users, ToggleLeft, ToggleRight, Plus, Minus, ChevronRight } from 'lucide-react'

/* ── Types ─────────────────────────────────────────────────────── */
type DemoOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered'
type DemoTab = 'kds' | 'menu' | 'pos'
interface DemoOrderItem { name: string; quantity: number; price: number }
interface DemoOrder {
  id: string; customerName: string; address: string
  items: DemoOrderItem[]; total: number; timestamp: Date
  status: DemoOrderStatus; source: 'customer' | 'pos'
}

/* ── Constants ─────────────────────────────────────────────────── */
const STATUS_NEXT: Record<DemoOrderStatus, DemoOrderStatus | null> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered', delivered: null,
}
const STATUS_LABEL: Record<DemoOrderStatus, string> = {
  pending: 'Accept Order', preparing: 'Mark Ready', ready: 'Mark Delivered', delivered: 'Delivered',
}
const STATUS_COLOR: Record<DemoOrderStatus, string> = {
  pending: '#f59e0b', preparing: '#3b82f6', ready: '#8b5cf6', delivered: '#22c55e',
}
const MOCK_ITEMS = [
  { id: '1',  name: 'Classic Burger',       price: 13.99, category: 'Burgers'  },
  { id: '2',  name: 'Mushroom Swiss Burger', price: 15.99, category: 'Burgers'  },
  { id: '3',  name: 'BBQ Bacon Burger',      price: 17.99, category: 'Burgers'  },
  { id: '4',  name: 'Margherita Pizza',      price: 18.99, category: 'Pizza'    },
  { id: '5',  name: 'BBQ Chicken Pizza',     price: 21.99, category: 'Pizza'    },
  { id: '6',  name: 'Caesar Salad',          price: 11.99, category: 'Salads'   },
  { id: '7',  name: 'Greek Salad',           price: 13.99, category: 'Salads'   },
  { id: '8',  name: 'Crispy Wings',          price: 14.99, category: 'Starters' },
  { id: '9',  name: 'Loaded Nachos',         price: 12.99, category: 'Starters' },
  { id: '10', name: 'Chocolate Lava Cake',   price:  9.99, category: 'Desserts' },
  { id: '11', name: 'Fresh Lemonade',        price:  4.99, category: 'Drinks'   },
  { id: '12', name: 'Craft Cola',            price:  3.99, category: 'Drinks'   },
]
const MOCK_CATEGORIES = ['All', 'Burgers', 'Pizza', 'Salads', 'Starters', 'Desserts', 'Drinks']

const now = Date.now()
const SEED_ORDERS: DemoOrder[] = [
  {
    id: 'SEED-001', customerName: 'Alex Chen',
    address: '47 Maple Ave, San Francisco, CA',
    items: [{ name: 'Classic Burger', quantity: 2, price: 13.99 }, { name: 'Fresh Lemonade', quantity: 2, price: 4.99 }],
    total: 37.94, timestamp: new Date(now - 18 * 60 * 1000), status: 'preparing', source: 'customer',
  },
  {
    id: 'SEED-002', customerName: 'Table 4',
    address: 'In-restaurant',
    items: [{ name: 'Margherita Pizza', quantity: 1, price: 18.99 }, { name: 'Caesar Salad', quantity: 1, price: 11.99 }, { name: 'Craft Cola', quantity: 2, price: 3.99 }],
    total: 38.96, timestamp: new Date(now - 7 * 60 * 1000), status: 'pending', source: 'pos',
  },
  {
    id: 'SEED-003', customerName: 'Maria Santos',
    address: '210 Valencia St, San Francisco, CA',
    items: [{ name: 'BBQ Bacon Burger', quantity: 1, price: 17.99 }, { name: 'Crispy Wings', quantity: 1, price: 14.99 }, { name: 'Chocolate Lava Cake', quantity: 1, price: 9.99 }],
    total: 47.24, timestamp: new Date(now - 32 * 60 * 1000), status: 'ready', source: 'customer',
  },
]

const PULSE_CSS = `
@keyframes hr-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0.5)} 50%{box-shadow:0 0 0 8px rgba(251,191,36,0)} }
.hr-new-order { animation: hr-pulse 1s ease-in-out 4; border: 2px solid #f59e0b !important; }
`

/* ── Helpers ───────────────────────────────────────────────────── */
function elapsed(ts: Date) {
  const mins = Math.floor((Date.now() - ts.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

/* ── DashboardChrome ───────────────────────────────────────────── */
function DashboardChrome({ activeTab, onTabChange, syncActive }: {
  activeTab: DemoTab; onTabChange: (t: DemoTab) => void; syncActive: boolean
}) {
  const tabs: { key: DemoTab; emoji: string; label: string }[] = [
    { key: 'kds',  emoji: '🎫', label: 'Orders / KDS' },
    { key: 'menu', emoji: '📋', label: 'Menu'          },
    { key: 'pos',  emoji: '🖥️', label: 'POS'           },
  ]
  return (
    <>
      <style>{`
        .hr-tab-label{display:inline}
        .hr-sync-label{display:inline}
        @media(max-width:640px){.hr-tab-label{display:none!important}.hr-sync-label{display:none!important}}
      `}</style>
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ background: '#16a34a', borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>RESTAURANT</div>
          <span className="hr-sync-label" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Demo Dashboard</span>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => onTabChange(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: 'none', background: activeTab === t.key ? '#16a34a' : 'transparent', color: activeTab === t.key ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: activeTab === t.key ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
              <span style={{ fontSize: 14 }}>{t.emoji}</span>
              <span className="hr-tab-label">{t.label}</span>
            </button>
          ))}
        </div>
        {/* Right: sync + customer link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: syncActive ? '#22c55e' : '#6b7280', display: 'inline-block', boxShadow: syncActive ? '0 0 6px #22c55e' : 'none' }} />
            <span className="hr-sync-label" style={{ fontSize: 12, color: syncActive ? '#22c55e' : '#6b7280', fontWeight: 600 }}>{syncActive ? 'Live Sync' : 'No Sync'}</span>
          </div>
          <a href="/theme-demo" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Customer View <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </>
  )
}

/* ── StatBar ───────────────────────────────────────────────────── */
function StatBar({ orders }: { orders: DemoOrder[] }) {
  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const active = orders.filter(o => o.status !== 'delivered').length
  const stats = [
    { icon: <ShoppingBag size={16} />, label: 'Orders Today', value: orders.length.toString(), color: '#3b82f6' },
    { icon: <TrendingUp size={16} />, label: 'Revenue', value: `$${revenue.toFixed(2)}`, color: '#16a34a' },
    { icon: <Clock size={16} />, label: 'Avg Prep', value: '14 min', color: '#f59e0b' },
    { icon: <Users size={16} />, label: 'Active', value: active.toString(), color: '#8b5cf6' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.color, marginBottom: 6 }}>{s.icon}<span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span></div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#111' }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}

/* ── OrderTicket ───────────────────────────────────────────────── */
function OrderTicket({ order, onAdvance, isNew }: { order: DemoOrder; onAdvance: () => void; isNew: boolean }) {
  const next = STATUS_NEXT[order.status]
  return (
    <div className={isNew ? 'hr-new-order' : ''} style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 10px rgba(0,0,0,0.07)', border: '2px solid transparent', transition: 'border 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#111' }}>{order.customerName}</span>
            <span style={{ fontSize: 10, fontWeight: 700, background: order.source === 'pos' ? '#ede9fe' : '#dbeafe', color: order.source === 'pos' ? '#7c3aed' : '#1d4ed8', borderRadius: 5, padding: '2px 6px' }}>{order.source === 'pos' ? 'POS' : 'Online'}</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.id} · {elapsed(order.timestamp)}</div>
        </div>
        <div style={{ background: `${STATUS_COLOR[order.status]}20`, color: STATUS_COLOR[order.status], borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{order.status}</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        {order.items.map((it, i) => (
          <div key={i} style={{ fontSize: 13, color: '#374151', padding: '3px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>× {it.quantity} {it.name}</span>
            <span style={{ color: '#6b7280' }}>${(it.price * it.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#111' }}>${order.total.toFixed(2)}</span>
        {next ? (
          <button onClick={onAdvance} style={{ background: STATUS_COLOR[order.status], color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            {STATUS_LABEL[order.status]}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#22c55e', fontWeight: 700, fontSize: 13 }}><Check size={14} /> Delivered</div>
        )}
      </div>
    </div>
  )
}

/* ── KDS Panel ─────────────────────────────────────────────────── */
function KDSPanel({ orders, newOrderIds, onAdvance }: {
  orders: DemoOrder[]; newOrderIds: Set<string>
  onAdvance: (id: string, next: DemoOrderStatus) => void
}) {
  const sorted = [...orders].sort((a, b) => {
    const pri: Record<DemoOrderStatus, number> = { pending: 0, preparing: 1, ready: 2, delivered: 3 }
    return pri[a.status] - pri[b.status] || b.timestamp.getTime() - a.timestamp.getTime()
  })
  return (
    <div>
      <style>{PULSE_CSS}</style>
      <StatBar orders={orders} />
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#374151' }}>No orders yet</p>
          <p style={{ fontSize: 14, margin: 0 }}>Open the customer view to place one <a href="/theme-demo" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 700 }}>→</a></p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {sorted.map(o => (
            <OrderTicket
              key={o.id} order={o} isNew={newOrderIds.has(o.id)}
              onAdvance={() => { const n = STATUS_NEXT[o.status]; if (n) onAdvance(o.id, n) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Menu Panel ────────────────────────────────────────────────── */
function MenuPanel({ availability, onToggle }: {
  availability: Record<string, boolean>
  onToggle: (id: string, val: boolean) => void
}) {
  const [cat, setCat] = useState('All')
  const filtered = cat === 'All' ? MOCK_ITEMS : MOCK_ITEMS.filter(i => i.category === cat)
  const available = Object.values(availability).filter(Boolean).length
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}><span style={{ fontWeight: 800, color: '#16a34a', fontSize: 18 }}>{available}</span> / {MOCK_ITEMS.length} items available</div>
      </div>
      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {MOCK_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: '6px 14px', borderRadius: 999, border: 'none', background: cat === c ? '#16a34a' : '#f3f4f6', color: cat === c ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>
      {/* Items table */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
        {filtered.map((item, i) => {
          const on = availability[item.id] !== false
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none', opacity: on ? 1 : 0.5 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.category} · ${item.price.toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: on ? '#16a34a' : '#ef4444' }}>{on ? 'Available' : "86'd"}</span>
                <button onClick={() => onToggle(item.id, !on)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: on ? '#16a34a' : '#ef4444', display: 'flex', alignItems: 'center' }}>
                  {on ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── POS Panel ─────────────────────────────────────────────────── */
function POSPanel({ onPlaceOrder }: { onPlaceOrder: (items: DemoOrderItem[], name: string) => void }) {
  const [posCart, setPosCart] = useState<Record<string, number>>({})
  const [customer, setCustomer] = useState('')
  const [posCat, setPosCat] = useState('All')
  const [placed, setPlaced] = useState(false)

  const addItem = (id: string) => setPosCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }))
  const removeItem = (id: string) => setPosCart(p => { const n = { ...p }; if (n[id] > 1) n[id]--; else delete n[id]; return n })
  const cartItems = MOCK_ITEMS.filter(i => posCart[i.id] > 0)
  const total = cartItems.reduce((s, i) => s + i.price * posCart[i.id], 0)
  const filtered = posCat === 'All' ? MOCK_ITEMS : MOCK_ITEMS.filter(i => i.category === posCat)

  const handlePlace = () => {
    if (!cartItems.length || !customer.trim()) return
    const items = cartItems.map(i => ({ name: i.name, quantity: posCart[i.id], price: i.price }))
    onPlaceOrder(items, customer.trim())
    setPosCart({})
    setCustomer('')
    setPlaced(true)
    setTimeout(() => setPlaced(false), 2500)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) min(340px, 100%)', gap: 20, alignItems: 'start' }}>
      {/* Item grid */}
      <div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {MOCK_CATEGORIES.map(c => (
            <button key={c} onClick={() => setPosCat(c)} style={{ padding: '5px 12px', borderRadius: 999, border: 'none', background: posCat === c ? '#16a34a' : '#f3f4f6', color: posCat === c ? '#fff' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {filtered.map(item => {
            const qty = posCart[item.id] || 0
            return (
              <button key={item.id} onClick={() => addItem(item.id)} style={{ background: qty > 0 ? '#f0fdf4' : '#fff', border: qty > 0 ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: 12, padding: 14, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                {qty > 0 && <span style={{ position: 'absolute', top: 8, right: 8, background: '#16a34a', color: '#fff', borderRadius: 999, width: 20, height: 20, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qty}</span>}
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#16a34a' }}>${item.price.toFixed(2)}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cart sidebar */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 10px rgba(0,0,0,0.07)', position: 'sticky', top: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 900, color: '#111' }}>🖥️ POS Order</h3>
        {/* Customer name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer / Table</label>
          <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="e.g. Table 3 or John" style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {['Table 1','Table 2','Table 3','Table 4','Walk-in'].map(t => (
              <button key={t} onClick={() => setCustomer(t)} style={{ background: customer === t ? '#16a34a' : '#f3f4f6', color: customer === t ? '#fff' : '#374151', border: 'none', borderRadius: 7, padding: '4px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        </div>
        {/* Cart items */}
        <div style={{ minHeight: 80, marginBottom: 14 }}>
          {cartItems.length === 0 ? (
            <p style={{ fontSize: 13, color: '#d1d5db', textAlign: 'center', padding: '20px 0' }}>Tap items to add them →</p>
          ) : cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', flex: 1 }}>{item.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => removeItem(item.id)} style={{ width: 22, height: 22, border: 'none', background: '#f3f4f6', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={11} /></button>
                <span style={{ fontSize: 13, fontWeight: 800, minWidth: 16, textAlign: 'center' }}>{posCart[item.id]}</span>
                <button onClick={() => addItem(item.id)} style={{ width: 22, height: 22, border: 'none', background: '#dcfce7', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><Plus size={11} /></button>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginLeft: 10, minWidth: 50, textAlign: 'right' }}>${(item.price * posCart[item.id]).toFixed(2)}</span>
            </div>
          ))}
        </div>
        {cartItems.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 17, color: '#111', marginBottom: 16, paddingTop: 10, borderTop: '2px solid #f5f5f5' }}>
            <span>Total</span><span style={{ color: '#16a34a' }}>${total.toFixed(2)}</span>
          </div>
        )}
        <button onClick={handlePlace} disabled={!cartItems.length || !customer.trim()} style={{ width: '100%', padding: '13px', background: placed ? '#22c55e' : (!cartItems.length || !customer.trim()) ? '#e5e7eb' : '#16a34a', color: placed || (!cartItems.length || !customer.trim()) ? (placed ? '#fff' : '#9ca3af') : '#fff', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: !cartItems.length || !customer.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {placed ? '✅ Order Sent to KDS!' : 'Place Order →'}
        </button>
      </div>
    </div>
  )
}

/* ── Main Dashboard Page ───────────────────────────────────────── */
export default function DemoDashboardPage() {
  const [orders, setOrders] = useState<DemoOrder[]>(SEED_ORDERS)
  const [activeTab, setActiveTab] = useState<DemoTab>('kds')
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    () => Object.fromEntries(MOCK_ITEMS.map(i => [i.id, true]))
  )
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())
  const [syncActive, setSyncActive] = useState(false)
  const channelRef = useRef<BroadcastChannel | null>(null)

  /* BroadcastChannel setup */
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return
    const ch = new BroadcastChannel('headlessresto_demo')
    channelRef.current = ch
    setSyncActive(true)

    // Catch-up: read orders already in localStorage
    try {
      const raw = localStorage.getItem('headlessresto_demo_orders')
      if (raw) {
        const stored: any[] = JSON.parse(raw)
        setOrders(prev => {
          const ids = new Set(prev.map(o => o.id))
          const novel = stored.filter(o => !ids.has(o.id)).map(o => ({ ...o, timestamp: new Date(o.timestamp) }))
          return [...prev, ...novel]
        })
      }
    } catch {}

    ch.onmessage = (event: MessageEvent) => {
      const { type, order, orderId, status, itemId } = event.data ?? {}
      if (type === 'NEW_ORDER' && order) {
        const incoming: DemoOrder = { ...order, timestamp: new Date(order.timestamp) }
        setOrders(prev => {
          if (prev.some(o => o.id === incoming.id)) return prev
          return [incoming, ...prev]
        })
        setNewOrderIds(prev => new Set(prev).add(incoming.id))
        setTimeout(() => setNewOrderIds(prev => { const n = new Set(prev); n.delete(incoming.id); return n }), 4000)
      }
      if (type === 'ITEM_UNAVAILABLE' && itemId) {
        setAvailability(prev => ({ ...prev, [itemId]: false }))
      }
    }
    return () => { ch.close(); channelRef.current = null; setSyncActive(false) }
  }, [])

  const handleStatusAdvance = (orderId: string, next: DemoOrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o))
    channelRef.current?.postMessage({ type: 'ORDER_STATUS', orderId, status: next })
  }

  const handleItemToggle = (itemId: string, val: boolean) => {
    setAvailability(prev => ({ ...prev, [itemId]: val }))
    channelRef.current?.postMessage({ type: val ? 'ITEM_AVAILABLE' : 'ITEM_UNAVAILABLE', itemId })
  }

  const handlePOSOrder = (items: DemoOrderItem[], customerName: string) => {
    const id = 'POS-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const order: DemoOrder = { id, customerName, address: 'In-restaurant', items, total, timestamp: new Date(), status: 'pending', source: 'pos' }
    setOrders(prev => [order, ...prev])
    setNewOrderIds(prev => new Set(prev).add(id))
    setTimeout(() => setNewOrderIds(prev => { const n = new Set(prev); n.delete(id); return n }), 4000)
    channelRef.current?.postMessage({ type: 'NEW_ORDER', order: { ...order, timestamp: order.timestamp.toISOString() } })
    // Persist to localStorage
    try {
      const updated = [{ ...order, timestamp: order.timestamp.toISOString() }]
      const existing = JSON.parse(localStorage.getItem('headlessresto_demo_orders') || '[]')
      localStorage.setItem('headlessresto_demo_orders', JSON.stringify([...existing, ...updated].slice(-50)))
    } catch {}
    setActiveTab('kds')
  }

  return (
    <div suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f5f7f5' }}>
      <DashboardChrome activeTab={activeTab} onTabChange={setActiveTab} syncActive={syncActive} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {activeTab === 'kds' && <KDSPanel orders={orders} newOrderIds={newOrderIds} onAdvance={handleStatusAdvance} />}
        {activeTab === 'menu' && <MenuPanel availability={availability} onToggle={handleItemToggle} />}
        {activeTab === 'pos' && <POSPanel onPlaceOrder={handlePOSOrder} />}
      </div>
    </div>
  )
}
