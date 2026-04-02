'use client'

import React, { useState } from 'react'
import { Plus, Minus, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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

export function MinimalTemplate({ restaurant, menuItems, categories }: TemplateProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const primaryColor = restaurant.brand_assets?.primary_color ?? '#000000'

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
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #eee', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 30 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{restaurant.name}</h1>
        <button
          onClick={() => setCartOpen(true)}
          style={{ position: 'relative', background: 'none', border: '1.5px solid #eee', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}
        >
          <ShoppingCart size={18} />
          Cart
          {totalQty > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: primaryColor, color: '#fff', borderRadius: 999, width: 20, height: 20, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalQty}</span>
          )}
        </button>
      </header>

      {/* Category Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', padding: '0 32px', borderBottom: '1px solid #eee', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '16px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: selectedCategory === cat ? 700 : 400,
              fontSize: 14,
              color: selectedCategory === cat ? primaryColor : '#666',
              borderBottom: selectedCategory === cat ? `2px solid ${primaryColor}` : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid - 3 col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24, padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        {filtered.map(item => (
          <div key={item.id} style={{ border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            {item.image_url ? (
              <div style={{ position: 'relative', height: 180 }}>
                <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ height: 180, background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={28} color="#ccc" />
              </div>
            )}
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>{item.name}</h3>
              {item.description && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888', lineHeight: 1.6 }}>{item.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontWeight: 800, fontSize: 17 }}>${item.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  style={{ padding: '8px 16px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer (right) */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 380, background: '#fff', padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Your Cart</h2>
              <button onClick={() => setCartOpen(false)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {cart.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', marginTop: 60 }}>Your cart is empty</p>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                        <p style={{ margin: '3px 0 0', fontWeight: 800, fontSize: 15 }}>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><Minus size={13} /></button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><Plus size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#888', fontSize: 13 }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, color: '#888', fontSize: 13 }}>
                    <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontWeight: 800, fontSize: 18 }}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      sessionStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(cart))
                      router.push(`/menu/${restaurant.slug}/checkout`)
                    }}
                    style={{ width: '100%', padding: '14px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                  >
                    Checkout
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
