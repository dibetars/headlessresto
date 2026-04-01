'use client'

import React, { useState } from 'react'
import { Plus, Minus, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'

interface TemplateProps {
  restaurant: { name: string; slug: string; brand_assets: any }
  menuItems: { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null }[]
  categories: string[]
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export function BoldTemplate({ restaurant, menuItems, categories }: TemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const primaryColor = restaurant.brand_assets?.primary_color ?? '#FF6B00'
  const heroText = restaurant.brand_assets?.hero_text ?? 'Order Fresh, Delivered Fast'

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0))
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0)

  const filtered = menuItems.filter(i => i.category === selectedCategory)

  return (
    <div style={{ background: '#111', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 280, background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)', display: 'flex', alignItems: 'flex-end', padding: '32px 24px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #111 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: -1 }}>{restaurant.name}</h1>
          <p style={{ margin: '8px 0 0', color: primaryColor, fontWeight: 700, fontSize: 16 }}>{heroText}</p>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '20px 24px 0', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: 700,
              fontSize: 13,
              background: selectedCategory === cat ? primaryColor : '#2a2a2a',
              color: selectedCategory === cat ? '#fff' : '#999',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: '20px 24px 120px' }}>
        {filtered.map(item => (
          <div key={item.id} style={{ background: '#1c1c1c', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
            {item.image_url ? (
              <div style={{ position: 'relative', height: 160 }}>
                <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ height: 160, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={32} color="#444" />
              </div>
            )}
            <div style={{ padding: '14px 16px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800 }}>{item.name}</h3>
              {item.description && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', lineHeight: 1.5 }}>{item.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: primaryColor, fontWeight: 900, fontSize: 20 }}>${item.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Cart Button */}
      {totalQty > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24,
            background: primaryColor, color: '#fff',
            border: 'none', borderRadius: 999, cursor: 'pointer',
            padding: '14px 24px', fontWeight: 800, fontSize: 15,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: `0 8px 32px ${primaryColor}55`,
            zIndex: 40,
          }}
        >
          <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 999, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{totalQty}</span>
          View Cart · ${total.toFixed(2)}
        </button>
      )}

      {/* Cart Slide-Over */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 380, background: '#1a1a1a', padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Your Cart</h2>
              <button onClick={() => setCartOpen(false)} style={{ background: '#2a2a2a', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #2a2a2a' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{item.name}</p>
                    <p style={{ margin: '4px 0 0', color: primaryColor, fontWeight: 800 }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2a2a2a', borderRadius: 10, padding: '4px 8px' }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4 }}><Minus size={14} /></button>
                    <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4 }}><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #2a2a2a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#666', fontSize: 13 }}>
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, color: '#666', fontSize: 13 }}>
                <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontWeight: 900, fontSize: 18 }}>
                <span>Total</span><span style={{ color: primaryColor }}>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => alert('Checkout coming soon')}
                style={{ width: '100%', padding: '16px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
