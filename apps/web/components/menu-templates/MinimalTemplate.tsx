'use client'

import React, { useState } from 'react'
import { Plus, Minus, X, Star, Clock, ShoppingCart, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface TemplateProps {
  restaurant: { name: string; slug: string; brand_assets: any }
  menuItems: { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null }[]
  categories: string[]
  onCheckout?: (cart: { id: string; name: string; price: number; quantity: number }[]) => void
  availability?: Record<string, boolean>
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

const CATEGORY_ICONS: Record<string, string> = {
  Pizza: '🍕', Burgers: '🍔', Salads: '🥗', Starters: '🍗',
  Desserts: '🍰', Drinks: '🥤', Pasta: '🍝', Sandwiches: '🥪',
  Tacos: '🌮', default: '🍽️'
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Pizza: 'linear-gradient(135deg, #c0392b, #e74c3c)',
  Burgers: 'linear-gradient(135deg, #d35400, #e67e22)',
  Salads: 'linear-gradient(135deg, #27ae60, #2ecc71)',
  Starters: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
  Desserts: 'linear-gradient(135deg, #c0392b, #e91e8c)',
  Drinks: 'linear-gradient(135deg, #2980b9, #3498db)',
  default: 'linear-gradient(135deg, #2c3e50, #34495e)'
}

function getItemMeta(name: string) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    rating: (4.1 + (hash % 9) * 0.1).toFixed(1),
    prepTime: 10 + (hash % 5) * 5,
    isPopular: hash % 4 === 0,
  }
}

export function MinimalTemplate({ restaurant, menuItems, categories, onCheckout, availability }: TemplateProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('All')

  const primaryColor = restaurant.brand_assets?.primary_color ?? '#16a34a'

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter(i => i.quantity > 0)
    )
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0)

  const featuredItems = filterCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === filterCategory)

  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: '#111', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* Sticky Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 32px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 16px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20 }}>🍃</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: '#111' }}>
            {restaurant.name}
          </h1>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: primaryColor, color: '#fff',
            border: 'none', borderRadius: 999, padding: '10px 20px',
            cursor: 'pointer', fontWeight: 700, fontSize: 14,
          }}
        >
          <ShoppingCart size={16} />
          {totalQty > 0 ? (
            <span>{totalQty} item{totalQty > 1 ? 's' : ''} · ${total.toFixed(2)}</span>
          ) : (
            <span>Cart</span>
          )}
        </button>
      </header>

      {/* Hero */}
      <div style={{
        background: '#fff', padding: '56px 40px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 32, flexWrap: 'wrap',
        borderBottom: '1px solid #f5f5f5',
      }}>
        <div style={{ flex: '1 1 380px', maxWidth: 520 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: `${primaryColor}18`, borderRadius: 999,
            padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 14 }}>🌿</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: primaryColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Fresh & Fast Delivery
            </span>
          </div>
          <h2 style={{
            margin: '0 0 8px', fontSize: 52, fontWeight: 900, lineHeight: 1.05,
            letterSpacing: -2, color: '#0f172a',
          }}>
            Satisfy
          </h2>
          <h2 style={{
            margin: '0 0 20px', fontSize: 52, fontWeight: 900, lineHeight: 1.05,
            letterSpacing: -2, color: primaryColor,
          }}>
            Your Hunger.
          </h2>
          <p style={{ margin: '0 0 32px', color: '#64748b', fontSize: 17, lineHeight: 1.6, maxWidth: 420 }}>
            Discover the best food from local restaurants and have it delivered to your door.
          </p>
          <button
            style={{
              background: primaryColor, color: '#fff', border: 'none',
              borderRadius: 14, padding: '14px 32px', fontWeight: 800,
              fontSize: 16, cursor: 'pointer',
              boxShadow: `0 8px 24px ${primaryColor}44`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
            onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Order Now
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Emoji Collage */}
        <div style={{
          flex: '0 0 auto', display: 'grid',
          gridTemplateColumns: '1fr 1fr', gap: 12,
          fontSize: 56, lineHeight: 1, userSelect: 'none',
        }}>
          {['🍔', '🍕', '🌮', '🥗'].map((e, i) => (
            <div key={i} style={{
              width: 88, height: 88, borderRadius: 20,
              background: i % 2 === 0 ? `${primaryColor}12` : '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #f0f0f0',
            }}>
              {e}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{
        background: '#f8fdf9', borderBottom: '1px solid #e8f5e9',
        padding: '18px 40px',
        display: 'flex', gap: 40, flexWrap: 'wrap',
      }}>
        {[
          { value: '45.8K+', label: 'Happy Customers' },
          { value: '4.9 ⭐', label: 'Rating' },
          { value: '30 min', label: 'Delivery' },
        ].map(stat => (
          <div key={stat.label}>
            <span style={{ fontWeight: 900, fontSize: 18, color: primaryColor }}>{stat.value}</span>
            {' '}
            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Explore Categories */}
      <div style={{ padding: '40px 40px 0' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: -0.5 }}>
          Explore Categories
        </h3>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setFilterCategory(cat) }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: selectedCategory === cat ? primaryColor : '#fff',
                border: `1.5px solid ${selectedCategory === cat ? primaryColor : '#e5e7eb'}`,
                borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
                minWidth: 90, flexShrink: 0,
                boxShadow: selectedCategory === cat
                  ? `0 4px 14px ${primaryColor}44`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 28 }}>{CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.default}</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: selectedCategory === cat ? '#fff' : '#374151',
                whiteSpace: 'nowrap',
              }}>
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Items */}
      <div id="featured-section" style={{ padding: '40px 40px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: -0.5 }}>
            Featured Items
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '6px 16px', borderRadius: 999, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: filterCategory === cat ? primaryColor : '#f3f4f6',
                  color: filterCategory === cat ? '#fff' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {featuredItems.map(item => {
            const meta = getItemMeta(item.name)
            const inCart = cart.find(c => c.id === item.id)
            const gradient = CATEGORY_GRADIENTS[item.category] ?? CATEGORY_GRADIENTS.default
            const isAvailable = availability?.[item.id] !== false
            return (
              <div
                key={item.id}
                style={{
                  background: '#fff', borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f0f0',
                  transition: 'box-shadow 0.2s',
                  opacity: isAvailable ? 1 : 0.55,
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: 180 }}>
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      height: '100%', background: gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 60, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
                        {CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.default}
                      </span>
                    </div>
                  )}
                  {meta.isPopular && (
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      background: '#ef4444', color: '#fff', fontSize: 10,
                      fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                      letterSpacing: 0.5, textTransform: 'uppercase',
                    }}>
                      🔥 POPULAR
                    </div>
                  )}
                  {!isAvailable && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 900, padding: '5px 14px', borderRadius: 999, letterSpacing: 1, textTransform: 'uppercase' }}>Sold Out</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 18px 18px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p style={{
                      margin: '0 0 12px', fontSize: 13, color: '#94a3b8', lineHeight: 1.55,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                    }}>
                      {item.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>{meta.rating}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                      <Clock size={12} />
                      <span style={{ fontSize: 12 }}>{meta.prepTime} min</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 900, fontSize: 20, color: primaryColor }}>
                      ${item.price.toFixed(2)}
                    </span>
                    {inCart ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        background: '#f3f4f6', borderRadius: 12, overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          style={{
                            background: 'none', border: 'none', color: '#374151',
                            width: 36, height: 36, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        ><Minus size={14} /></button>
                        <span style={{ fontWeight: 900, fontSize: 14, minWidth: 28, textAlign: 'center', color: '#111' }}>
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          style={{
                            background: primaryColor, border: 'none', color: '#fff',
                            width: 36, height: 36, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        ><Plus size={14} /></button>
                      </div>
                    ) : isAvailable ? (
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: primaryColor, color: '#fff', border: 'none',
                          borderRadius: 12, padding: '9px 16px', cursor: 'pointer',
                          fontWeight: 700, fontSize: 13,
                          boxShadow: `0 4px 12px ${primaryColor}44`,
                        }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Sold out</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#f9fafb', borderTop: '2px solid #f0f0f0', padding: '56px 40px 32px', marginTop: 16 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 48 }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 22 }}>🍃</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>{restaurant.name}</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>
                Fresh ingredients, fast delivery. We believe great food should come to you.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ icon: '🐦', label: 'Twitter' }, { icon: '📸', label: 'Instagram' }, { icon: '📘', label: 'Facebook' }].map(s => (
                  <div key={s.label} title={s.label} style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }}>{s.icon}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#111', fontSize: 13, fontWeight: 800, margin: '0 0 16px' }}>Quick Links</p>
                {['Menu', 'About Us', 'Catering', 'Gift Cards', 'Careers'].map(l => (
                  <p key={l} style={{ color: '#6b7280', fontSize: 14, margin: '0 0 10px', cursor: 'pointer' }}>{l}</p>
                ))}
              </div>
              <div>
                <p style={{ color: '#111', fontSize: 13, fontWeight: 800, margin: '0 0 16px' }}>Hours</p>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 6px' }}>Mon–Fri</p>
                <p style={{ color: '#374151', fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>11:00 AM – 10:00 PM</p>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 6px' }}>Sat–Sun</p>
                <p style={{ color: '#374151', fontSize: 14, fontWeight: 600, margin: 0 }}>10:00 AM – 11:00 PM</p>
              </div>
              <div>
                <p style={{ color: '#111', fontSize: 13, fontWeight: 800, margin: '0 0 16px' }}>Contact</p>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 8px' }}>📍 123 Fresh Ave, City</p>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 8px' }}>📞 (555) 123-4567</p>
                <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>✉️ hello@{restaurant.slug}.com</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `2px solid ${primaryColor}22`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>© 2026 {restaurant.name}. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Privacy Policy', 'Terms of Service', 'Accessibility'].map(l => (
                <span key={l} style={{ color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            onClick={() => setCartOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)' }}
          />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 400, background: '#fff', padding: '28px 24px',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingCart size={20} color={primaryColor} />
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111' }}>Your Cart</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#374151' }}
              ><X size={18} /></button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <ShoppingCart size={48} color="#d1d5db" />
                <p style={{ color: '#9ca3af', fontSize: 15, textAlign: 'center', margin: 0 }}>
                  Your cart is empty.<br />Start adding items!
                </p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 0', borderBottom: '1px solid #f3f4f6',
                    }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 15, color: primaryColor }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        background: '#f3f4f6', borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                      }}>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          style={{ background: 'none', border: 'none', color: '#374151', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        ><Minus size={13} /></button>
                        <span style={{ fontWeight: 900, fontSize: 13, minWidth: 24, textAlign: 'center', color: '#111' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          style={{ background: primaryColor, border: 'none', color: '#fff', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        ><Plus size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#9ca3af', fontSize: 14 }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, color: '#9ca3af', fontSize: 14 }}>
                    <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 900, fontSize: 20, color: '#111' }}>
                    <span>Total</span>
                    <span style={{ color: primaryColor }}>${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (onCheckout) {
                        onCheckout(cart)
                      } else {
                        sessionStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(cart))
                        router.push(`/menu/${restaurant.slug}/checkout`)
                      }
                    }}
                    style={{
                      width: '100%', padding: '16px',
                      background: primaryColor, color: '#fff',
                      border: 'none', borderRadius: 14,
                      fontWeight: 900, fontSize: 16, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: `0 8px 24px ${primaryColor}44`,
                    }}
                  >
                    Proceed to Checkout
                    <ChevronRight size={18} />
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
