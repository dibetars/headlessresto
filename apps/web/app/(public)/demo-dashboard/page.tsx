'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
interface DemoMenuItem { id: string; name: string; price: number; category: string; image_url?: string }

/* ── Stock photos (Unsplash, stable IDs) ───────────────────────── */
const STOCK_PHOTOS: Record<string, string[]> = {
  Burgers: [
    'https://images.unsplash.com/photo-1568901289442-5b6e0b8b0b5f?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop&q=80',
  ],
  Pizza: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574071347293-0e9fdebceaa9?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&q=80',
  ],
  Salads: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546069782-d4490a0f03b4?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540420611562-5e8b3261419c?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=300&fit=crop&q=80',
  ],
  Starters: [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541614101520-9db3ab1d2202?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562059390-a761a084768e?w=400&h=300&fit=crop&q=80',
  ],
  Desserts: [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop&q=80',
  ],
  Drinks: [
    'https://images.unsplash.com/photo-1544145045-5d9b5a54afab?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562441272-4dbe17bd0c73?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop&q=80',
  ],
  _default: [
    'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80',
  ],
}

const BASE_ITEMS: DemoMenuItem[] = [
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
const BASE_CATEGORIES = ['Burgers', 'Pizza', 'Salads', 'Starters', 'Desserts', 'Drinks']

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
function MenuPanel({ menuItems, availability, onToggle, onAdd }: {
  menuItems: DemoMenuItem[]
  availability: Record<string, boolean>
  onToggle: (id: string, val: boolean) => void
  onAdd: (item: DemoMenuItem) => void
}) {
  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))]
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', category: BASE_CATEGORIES[0] })
  const [customCat, setCustomCat] = useState('')
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [urlInput, setUrlInput] = useState('')
  const [imageTab, setImageTab] = useState<'stock' | 'url' | 'upload'>('stock')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = cat === 'All' ? menuItems : menuItems.filter(i => i.category === cat)
  const available = menuItems.filter(i => availability[i.id] !== false).length
  const stockPhotos = STOCK_PHOTOS[form.category] ?? STOCK_PHOTOS._default

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setSelectedImage(ev.target?.result as string); setImageTab('upload') }
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    const name = form.name.trim()
    const price = parseFloat(form.price)
    const category = form.category === '__custom__' ? customCat.trim() : form.category
    if (!name || !price || !category) return
    const image_url = imageTab === 'url' ? urlInput.trim() || undefined : selectedImage || undefined
    const newItem: DemoMenuItem = { id: 'CUSTOM-' + Math.random().toString(36).slice(2, 8).toUpperCase(), name, price, category, image_url }
    onAdd(newItem)
    setForm({ name: '', price: '', category: BASE_CATEGORIES[0] })
    setCustomCat('')
    setSelectedImage('')
    setUrlInput('')
    setImageTab('stock')
    setShowForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}><span style={{ fontWeight: 800, color: '#16a34a', fontSize: 18 }}>{available}</span> / {menuItems.length} items available</div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: showForm ? '#f3f4f6' : '#16a34a', color: showForm ? '#374151' : '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {/* Add item form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: '0 1px 10px rgba(0,0,0,0.07)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '2 1 160px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Item Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Truffle Fries" style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ flex: '1 1 90px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Price ($)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff' }}>
              {Array.from(new Set([...BASE_CATEGORIES, ...menuItems.map(i => i.category)])).map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__custom__">+ New category…</option>
            </select>
          </div>
          {form.category === '__custom__' && (
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category Name</label>
              <input value={customCat} onChange={e => setCustomCat(e.target.value)} placeholder="e.g. Specials" style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }} />
            </div>
          )}
          {/* Image section — full width */}
          <div style={{ flex: '1 1 100%', marginTop: 4 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Image</label>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {(['stock', 'url', 'upload'] as const).map(tab => (
                <button key={tab} onClick={() => setImageTab(tab)} style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${imageTab === tab ? '#16a34a' : '#e5e7eb'}`, background: imageTab === tab ? '#f0fdf4' : '#fff', color: imageTab === tab ? '#16a34a' : '#6b7280', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {tab === 'stock' ? '🖼️ Stock' : tab === 'url' ? '🔗 URL' : '⬆️ Upload'}
                </button>
              ))}
            </div>
            {imageTab === 'stock' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {/* No image option */}
                <button onClick={() => setSelectedImage('')} style={{ aspectRatio: '4/3', borderRadius: 8, border: `2px solid ${selectedImage === '' ? '#16a34a' : '#e5e7eb'}`, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18 }}>
                  🚫
                </button>
                {stockPhotos.map((url, i) => (
                  <button key={i} onClick={() => setSelectedImage(url)} style={{ aspectRatio: '4/3', borderRadius: 8, border: `2px solid ${selectedImage === url ? '#16a34a' : '#e5e7eb'}`, background: '#f0f0f0', overflow: 'hidden', cursor: 'pointer', padding: 0 }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
            {imageTab === 'url' && (
              <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/image.jpg" style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }} />
            )}
            {imageTab === 'upload' && (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 18px', border: '1.5px dashed #d1d5db', borderRadius: 9, background: '#f9fafb', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%' }}>
                  {selectedImage && imageTab === 'upload' ? '✅ Image selected — click to change' : '📁 Choose file from device'}
                </button>
              </div>
            )}
            {/* Preview */}
            {(selectedImage || (imageTab === 'url' && urlInput)) && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={imageTab === 'url' ? urlInput : selectedImage} alt="preview" style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Preview</span>
              </div>
            )}
          </div>
          <button onClick={handleAdd} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>Add to Menu</button>
        </div>
      )}

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: '6px 14px', borderRadius: 999, border: 'none', background: cat === c ? '#16a34a' : '#f3f4f6', color: cat === c ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>
      {/* Items table */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
        {filtered.map((item, i) => {
          const on = availability[item.id] !== false
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none', opacity: on ? 1 : 0.5, gap: 12 }}>
              {/* Thumbnail */}
              <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🍽️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{item.name}</span>
                  {item.id.startsWith('CUSTOM-') && <span style={{ fontSize: 10, fontWeight: 700, background: '#ede9fe', color: '#7c3aed', borderRadius: 5, padding: '1px 6px' }}>NEW</span>}
                </div>
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
function POSPanel({ menuItems, onPlaceOrder }: { menuItems: DemoMenuItem[]; onPlaceOrder: (items: DemoOrderItem[], name: string) => void }) {
  const [posCart, setPosCart] = useState<Record<string, number>>({})
  const [customer, setCustomer] = useState('')
  const [posCat, setPosCat] = useState('All')
  const [placed, setPlaced] = useState(false)

  const addItem = (id: string) => setPosCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }))
  const removeItem = (id: string) => setPosCart(p => { const n = { ...p }; if (n[id] > 1) n[id]--; else delete n[id]; return n })
  const cartItems = menuItems.filter(i => posCart[i.id] > 0)
  const total = cartItems.reduce((s, i) => s + i.price * posCart[i.id], 0)
  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))]
  const filtered = posCat === 'All' ? menuItems : menuItems.filter(i => i.category === posCat)

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
          {categories.map(c => (
            <button key={c} onClick={() => setPosCat(c)} style={{ padding: '5px 12px', borderRadius: 999, border: 'none', background: posCat === c ? '#16a34a' : '#f3f4f6', color: posCat === c ? '#fff' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {filtered.map(item => {
            const qty = posCart[item.id] || 0
            return (
              <button key={item.id} onClick={() => addItem(item.id)} style={{ background: qty > 0 ? '#f0fdf4' : '#fff', border: qty > 0 ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: 12, padding: 0, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', position: 'relative', overflow: 'hidden' }}>
                {qty > 0 && <span style={{ position: 'absolute', top: 6, right: 6, background: '#16a34a', color: '#fff', borderRadius: 999, width: 20, height: 20, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>{qty}</span>}
                {item.image_url && (
                  <div style={{ width: '100%', height: 72, overflow: 'hidden' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#16a34a' }}>${item.price.toFixed(2)}</div>
                </div>
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
  const [menuItems, setMenuItems] = useState<DemoMenuItem[]>(BASE_ITEMS)
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    () => Object.fromEntries(BASE_ITEMS.map(i => [i.id, true]))
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

  const handleAddMenuItem = (item: DemoMenuItem) => {
    setMenuItems(prev => [...prev, item])
    setAvailability(prev => ({ ...prev, [item.id]: true }))
    channelRef.current?.postMessage({ type: 'MENU_ITEM_ADDED', item })
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
        {activeTab === 'menu' && <MenuPanel menuItems={menuItems} availability={availability} onToggle={handleItemToggle} onAdd={handleAddMenuItem} />}
        {activeTab === 'pos' && <POSPanel menuItems={menuItems} onPlaceOrder={handlePOSOrder} />}
      </div>
    </div>
  )
}
