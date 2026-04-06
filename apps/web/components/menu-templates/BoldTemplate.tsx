'use client'

import React, { useState } from 'react'
import { Plus, Minus, X, Star, Clock, ShoppingBag, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface TemplateProps {
  restaurant: { name: string; slug: string; brand_assets: any }
  menuItems: { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null }[]
  categories: string[]
  onCheckout?: (cart: { id: string; name: string; price: number; quantity: number }[]) => void
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

export function BoldTemplate({ restaurant, menuItems, categories, onCheckout }: TemplateProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const primaryColor = restaurant.brand_assets?.primary_color ?? '#FF6B00'

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

  const filtered = menuItems.filter(i => i.category === selectedCategory)

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* Sticky Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🍔</span>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, color: '#fff' }}>
              {restaurant.name}
            </span>
          </div>
          <span style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: 10, fontWeight: 800,
            padding: '3px 10px', borderRadius: 999, letterSpacing: 1,
            textTransform: 'uppercase',
          }}>OPEN</span>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: totalQty > 0 ? primaryColor : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: 999, padding: '10px 18px',
            cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 14,
            transition: 'all 0.2s',
          }}
        >
          <ShoppingBag size={16} />
          {totalQty > 0 ? (
            <>
              <span style={{
                background: 'rgba(0,0,0,0.25)', borderRadius: 999,
                width: 22, height: 22, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12, fontWeight: 900,
              }}>{totalQty}</span>
              <span>${total.toFixed(2)}</span>
            </>
          ) : (
            <span>Cart</span>
          )}
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1500 100%)',
        padding: '60px 32px 48px',
        minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {/* Watermark emoji */}
        <div style={{
          position: 'absolute', right: -20, top: -20,
          fontSize: 200, opacity: 0.06, lineHeight: 1,
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {CATEGORY_ICONS[selectedCategory] ?? CATEGORY_ICONS.default}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${primaryColor}22`, border: `1px solid ${primaryColor}44`,
          borderRadius: 999, padding: '6px 16px', marginBottom: 20,
          width: 'fit-content',
        }}>
          <span style={{ fontSize: 16 }}>🎁</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: primaryColor, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            FREE DELIVERY ON YOUR FIRST ORDER
          </span>
        </div>

        <h1 style={{
          margin: '0 0 12px', fontSize: 48, fontWeight: 900, lineHeight: 1.05,
          letterSpacing: -1.5, color: '#fff',
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          {restaurant.brand_assets?.hero_text ?? 'Order Fresh,\nDelivered Fast'}
        </h1>
        <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.55)', fontSize: 16, fontWeight: 400, maxWidth: 480 }}>
          Hot food at your door in minutes. No hassle, just great taste.
        </p>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[
            { icon: '⭐', label: '4.9 Rating' },
            { icon: '🚀', label: '25 min Avg Delivery' },
            { icon: '🎁', label: 'Free First Delivery' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{stat.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto',
        padding: '24px 24px 0', scrollbarWidth: 'none',
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '10px 20px', borderRadius: 999, border: 'none',
              cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700,
              fontSize: 13, letterSpacing: 0.3,
              background: selectedCategory === cat ? primaryColor : '#1a1a1a',
              color: selectedCategory === cat ? '#fff' : '#888',
              boxShadow: selectedCategory === cat ? `0 4px 16px ${primaryColor}55` : 'none',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 15 }}>{CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.default}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20, padding: '24px 24px 120px',
      }}>
        {filtered.map(item => {
          const meta = getItemMeta(item.name)
          const inCart = cart.find(c => c.id === item.id)
          const gradient = CATEGORY_GRADIENTS[item.category] ?? CATEGORY_GRADIENTS.default
          return (
            <div
              key={item.id}
              style={{
                background: '#1a1a1a', borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}
            >
              {/* Image Area */}
              <div style={{ position: 'relative', height: 180 }}>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    height: '100%', background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 64, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                      {CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.default}
                    </span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(26,26,26,0.7) 0%, transparent 50%)',
                }} />
                {/* Popular Badge */}
                {meta.isPopular && (
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'linear-gradient(135deg, #ff6b00, #ff4500)',
                    color: '#fff', fontSize: 10, fontWeight: 900,
                    padding: '4px 10px', borderRadius: 999, letterSpacing: 1,
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(255,107,0,0.5)',
                  }}>
                    🔥 POPULAR
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 18px 18px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: '#fff' }}>
                  {item.name}
                </h3>
                {item.description && (
                  <p style={{
                    margin: '0 0 12px', fontSize: 13, color: '#666',
                    lineHeight: 1.55, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {item.description}
                  </p>
                )}

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                    <Star size={12} fill="#f59e0b" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{meta.rating}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666' }}>
                    <Clock size={12} />
                    <span style={{ fontSize: 12 }}>{meta.prepTime} min</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: primaryColor, fontWeight: 900, fontSize: 22 }}>
                    ${item.price.toFixed(2)}
                  </span>
                  {inCart ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 0,
                      background: '#252525', borderRadius: 12, overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        style={{
                          background: 'none', border: 'none', color: '#fff',
                          width: 36, height: 36, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      ><Minus size={14} /></button>
                      <span style={{ fontWeight: 900, fontSize: 14, minWidth: 28, textAlign: 'center', color: '#fff' }}>
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
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        width: 40, height: 40, borderRadius: 12, border: 'none',
                        background: primaryColor, color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 14px ${primaryColor}55`,
                        transition: 'transform 0.15s',
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 32px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 48 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>🍔</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>{restaurant.name}</span>
              </div>
              <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
                Hot food at your door in minutes. No hassle, just great taste. Serving your city since 2020.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ icon: '🐦', label: 'Twitter' }, { icon: '📸', label: 'Instagram' }, { icon: '📘', label: 'Facebook' }].map(s => (
                  <div key={s.label} title={s.label} style={{ width: 34, height: 34, borderRadius: 8, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer' }}>{s.icon}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 16px' }}>Menu</p>
                {['Burgers', 'Pizza', 'Salads', 'Desserts', 'Drinks'].map(l => (
                  <p key={l} style={{ color: '#444', fontSize: 14, margin: '0 0 10px', cursor: 'pointer' }}>{l}</p>
                ))}
              </div>
              <div>
                <p style={{ color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 16px' }}>Company</p>
                {['About Us', 'Careers', 'Press', 'Blog'].map(l => (
                  <p key={l} style={{ color: '#444', fontSize: 14, margin: '0 0 10px', cursor: 'pointer' }}>{l}</p>
                ))}
              </div>
              <div>
                <p style={{ color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 16px' }}>Hours</p>
                <p style={{ color: '#444', fontSize: 14, margin: '0 0 6px' }}>Mon–Fri: 11am – 10pm</p>
                <p style={{ color: '#444', fontSize: 14, margin: '0 0 20px' }}>Sat–Sun: 10am – 11pm</p>
                <p style={{ color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 12px' }}>Contact</p>
                <p style={{ color: '#444', fontSize: 14, margin: '0 0 6px' }}>📞 (555) 123-4567</p>
                <p style={{ color: '#444', fontSize: 14, margin: 0 }}>✉️ hello@{restaurant.slug}.com</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#333', fontSize: 12, margin: 0 }}>© 2026 {restaurant.name}. All rights reserved. · Privacy Policy · Terms</p>
            <p style={{ color: '#333', fontSize: 12, margin: 0 }}>Powered by HeadlessResto</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            onClick={() => setCartOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 400, background: '#111', padding: '28px 24px',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 48px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={20} color={primaryColor} />
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>Your Cart</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{
                  background: '#222', border: 'none', borderRadius: 10,
                  padding: 8, cursor: 'pointer', color: '#888',
                }}
              ><X size={18} /></button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <ShoppingBag size={48} color="#333" />
                <p style={{ color: '#555', fontSize: 15, textAlign: 'center', margin: 0 }}>
                  Your cart is empty.<br />Add something delicious!
                </p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        <p style={{ margin: '4px 0 0', color: primaryColor, fontWeight: 800, fontSize: 15 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        background: '#222', borderRadius: 10, overflow: 'hidden',
                        flexShrink: 0,
                      }}>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          style={{ background: 'none', border: 'none', color: '#888', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        ><Minus size={13} /></button>
                        <span style={{ fontWeight: 900, fontSize: 13, minWidth: 24, textAlign: 'center', color: '#fff' }}>
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

                <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#666', fontSize: 14 }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, color: '#666', fontSize: 14 }}>
                    <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 900, fontSize: 20, color: '#fff' }}>
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
                      width: '100%', padding: '16px', background: primaryColor,
                      color: '#fff', border: 'none', borderRadius: 14,
                      fontWeight: 900, fontSize: 16, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: `0 8px 24px ${primaryColor}55`,
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
