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

export function WarmTemplate({ restaurant, menuItems, categories }: TemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const primaryColor = restaurant.brand_assets?.primary_color ?? '#C17C3A'
  const heroText = restaurant.brand_assets?.hero_text ?? 'Crafted with love, served with warmth'

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
    <div style={{ background: '#FAF7F2', minHeight: '100vh', fontFamily: 'Georgia, serif', color: '#3d2b1f' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', height: 260, background: `linear-gradient(135deg, #8B6344 0%, #C17C3A 50%, #D4956A 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{restaurant.name}</h1>
          <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 16, fontStyle: 'italic' }}>{heroText}</p>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '24px 24px 0', scrollbarWidth: 'none', justifyContent: 'center', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '9px 22px',
              borderRadius: 999,
              border: `2px solid ${selectedCategory === cat ? primaryColor : '#D4C5B0'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'Georgia, serif',
              fontWeight: 600,
              fontSize: 14,
              background: selectedCategory === cat ? primaryColor : '#FAF7F2',
              color: selectedCategory === cat ? '#fff' : '#6b4f35',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry-style Grid */}
      <div style={{ columns: '300px', columnGap: 20, padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            style={{
              background: idx % 3 === 0 ? '#FFF8F0' : idx % 3 === 1 ? '#FEF3E8' : '#FAF7F2',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #E8D9C8',
              marginBottom: 20,
              breakInside: 'avoid',
            }}
          >
            {item.image_url && (
              <div style={{ position: 'relative', height: idx % 2 === 0 ? 200 : 140 }}>
                <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(61,43,31,0.15) 100%)' }} />
              </div>
            )}
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#3d2b1f' }}>{item.name}</h3>
              {item.description && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#8B6F5A', lineHeight: 1.6, fontStyle: 'italic' }}>{item.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 18, color: primaryColor }}>${item.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${primaryColor}44` }}
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {totalQty > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed', bottom: 28, right: 28,
            background: primaryColor, color: '#fff',
            border: 'none', borderRadius: 999, cursor: 'pointer',
            width: 64, height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 28px ${primaryColor}55`,
            zIndex: 40,
          }}
        >
          <ShoppingCart size={24} />
          <span style={{ position: 'absolute', top: 4, right: 4, background: '#fff', color: primaryColor, borderRadius: 999, width: 22, height: 22, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalQty}</span>
        </button>
      )}

      {/* Cart Panel */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(61,43,31,0.5)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 380, background: '#FFF8F0', padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', fontFamily: 'Georgia, serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#3d2b1f' }}>Your Selection</h2>
              <button onClick={() => setCartOpen(false)} style={{ background: '#E8D9C8', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#3d2b1f' }}><X size={18} /></button>
            </div>
            {cart.length === 0 ? (
              <p style={{ color: '#8B6F5A', textAlign: 'center', marginTop: 60, fontStyle: 'italic' }}>Nothing here yet — add something delicious!</p>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #E8D9C8' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#3d2b1f' }}>{item.name}</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 700, color: primaryColor }}>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E8D9C8', borderRadius: 999, padding: '4px 8px' }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', color: '#6b4f35', cursor: 'pointer', padding: 2 }}><Minus size={13} /></button>
                        <span style={{ fontWeight: 700, minWidth: 18, textAlign: 'center', color: '#3d2b1f' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', color: '#6b4f35', cursor: 'pointer', padding: 2 }}><Plus size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: 20, borderTop: '1px solid #D4C5B0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#8B6F5A', fontSize: 14 }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, color: '#8B6F5A', fontSize: 14 }}>
                    <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22, fontWeight: 800, fontSize: 20, color: '#3d2b1f' }}>
                    <span>Total</span><span style={{ color: primaryColor }}>${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => alert('Checkout coming soon')}
                    style={{ width: '100%', padding: '15px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: `0 4px 16px ${primaryColor}44` }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
