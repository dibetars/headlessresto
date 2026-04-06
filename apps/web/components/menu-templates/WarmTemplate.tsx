'use client'

import React, { useState } from 'react'
import { Plus, Minus, X, Star, Clock, ShoppingCart, ChevronRight } from 'lucide-react'
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

const PROMO_BANNERS = [
  { emoji: '🎁', text: 'Large Discounts up to 50%', sub: 'Limited time', bg: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { emoji: '🆕', text: 'Try New Flavours', sub: 'Just arrived', bg: 'linear-gradient(135deg, #0d9488, #0891b2)' },
  { emoji: '💰', text: 'Give $15 Get $20', sub: 'Refer a friend', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  { emoji: '🔥', text: 'Deal of the Day', sub: 'Today only', bg: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
]

export function WarmTemplate({ restaurant, menuItems, categories }: TemplateProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

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

  const filtered = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === selectedCategory)

  return (
    <div style={{ background: '#f5f7f0', minHeight: '100vh', color: '#1a2e1a', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #2d5a1b 0%, #3d7a25 50%, #4a8c2a 100%)',
        minHeight: 380, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '48px 32px',
      }}>
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />

        {/* Rating badge */}
        <div style={{
          position: 'absolute', top: 24, right: 24, zIndex: 2,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 14, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Star size={14} fill="#fbbf24" color="#fbbf24" />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>4.9</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Rating</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>
          <h1 style={{
            margin: '0 0 16px', fontSize: 44, fontWeight: 900, color: '#fff',
            lineHeight: 1.1, letterSpacing: -1.5,
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}>
            Your Favorite Meals,<br />Delivered
          </h1>
          <p style={{ margin: '0 0 32px', color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.6 }}>
            From local kitchens to your door — fresh, fast, and delicious.
          </p>

          {/* Search bar (decorative) */}
          <div style={{
            background: 'rgba(255,255,255,0.95)', borderRadius: 16,
            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10,
            maxWidth: 440, margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <span style={{ color: '#9ca3af', fontSize: 15, fontWeight: 400 }}>
              Search for burgers, pizza, sushi...
            </span>
          </div>
        </div>
      </div>

      {/* Promo Banners */}
      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto', scrollbarWidth: 'none',
        padding: '24px 24px 0',
      }}>
        {PROMO_BANNERS.map((promo, i) => (
          <div
            key={i}
            style={{
              background: promo.bg, borderRadius: 20, padding: '20px 24px',
              minWidth: 200, flexShrink: 0, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              transition: 'transform 0.15s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{promo.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1.3 }}>{promo.text}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 500 }}>{promo.sub}</div>
          </div>
        ))}
      </div>

      {/* Category Icons Row */}
      <div style={{ padding: '32px 24px 0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: '#1a2e1a', letterSpacing: -0.4 }}>
          What are you craving?
        </h3>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['All', ...categories].map(cat => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                  padding: '8px 4px',
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: isActive ? primaryColor : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, boxShadow: isActive
                    ? `0 6px 16px ${primaryColor}55`
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                  border: isActive ? 'none' : '1.5px solid #e5e7eb',
                }}>
                  {cat === 'All' ? '🍽️' : (CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.default)}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: isActive ? primaryColor : '#6b7280',
                  whiteSpace: 'nowrap',
                }}>
                  {cat}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Featured Food Items */}
      <div style={{ padding: '32px 24px 120px' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 900, color: '#1a2e1a', letterSpacing: -0.5 }}>
          Featured Food Items
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(item => {
            const meta = getItemMeta(item.name)
            const inCart = cart.find(c => c.id === item.id)
            const gradient = CATEGORY_GRADIENTS[item.category] ?? CATEGORY_GRADIENTS.default
            return (
              <div
                key={item.id}
                style={{
                  background: '#fff', borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s',
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
                      <span style={{ fontSize: 60, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}>
                        {CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.default}
                      </span>
                    </div>
                  )}
                  {meta.isPopular && (
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      background: primaryColor, color: '#fff',
                      fontSize: 11, fontWeight: 800,
                      padding: '4px 10px', borderRadius: 999,
                      letterSpacing: 0.3,
                    }}>
                      -15%
                    </div>
                  )}
                  {meta.isPopular && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                      color: '#fff', fontSize: 10, fontWeight: 800,
                      padding: '4px 10px', borderRadius: 999, letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}>
                      🔥 Popular
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 18px 18px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#1a2e1a', letterSpacing: -0.3 }}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p style={{
                      margin: '0 0 12px', fontSize: 13, color: '#6b7280', lineHeight: 1.55,
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af' }}>
                      <Clock size={12} />
                      <span style={{ fontSize: 12 }}>{meta.prepTime} min</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {meta.isPopular && (
                        <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through', lineHeight: 1 }}>
                          ${(item.price * 1.18).toFixed(2)}
                        </div>
                      )}
                      <span style={{ fontWeight: 900, fontSize: 20, color: primaryColor }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
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
                    ) : (
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
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalQty > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 40,
            background: primaryColor, color: '#fff', border: 'none',
            borderRadius: 999, padding: '14px 22px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            fontWeight: 800, fontSize: 15,
            boxShadow: `0 8px 28px ${primaryColor}55`,
          }}
        >
          <ShoppingCart size={18} />
          <span>{totalQty} item{totalQty > 1 ? 's' : ''} · ${total.toFixed(2)}</span>
        </button>
      )}

      {/* Cart Panel */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            onClick={() => setCartOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)' }}
          />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 400, background: '#fafdf9', padding: '28px 24px',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingCart size={20} color={primaryColor} />
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1a2e1a' }}>Your Order</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{ background: '#e8f0e9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#374151' }}
              ><X size={18} /></button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <ShoppingCart size={48} color="#d1d5db" />
                <p style={{ color: '#9ca3af', fontSize: 15, textAlign: 'center', margin: 0 }}>
                  Nothing in your cart yet.<br />Explore and add something!
                </p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 0', borderBottom: '1px solid #e8f0e9',
                    }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1a2e1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 15, color: primaryColor }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        background: '#e8f0e9', borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                      }}>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          style={{ background: 'none', border: 'none', color: '#374151', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        ><Minus size={13} /></button>
                        <span style={{ fontWeight: 900, fontSize: 13, minWidth: 24, textAlign: 'center', color: '#1a2e1a' }}>
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

                <div style={{ paddingTop: 20, borderTop: '1px solid #d1e8d1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#6b7280', fontSize: 14 }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, color: '#6b7280', fontSize: 14 }}>
                    <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 900, fontSize: 20, color: '#1a2e1a' }}>
                    <span>Total</span>
                    <span style={{ color: primaryColor }}>${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      sessionStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(cart))
                      router.push(`/menu/${restaurant.slug}/checkout`)
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
