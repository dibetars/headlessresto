'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { placePublicOrderAction } from '@/app/auth/actions/public-orders'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { slug } = params

  const [cart, setCart] = useState<CartItem[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem(`cart_${slug}`)
    if (stored) {
      try { setCart(JSON.parse(stored)) } catch {}
    }
  }, [slug])

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    const result = await placePublicOrderAction({
      slug,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: cart,
      total,
    })
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }
    sessionStorage.removeItem(`cart_${slug}`)
    router.push(`/menu/${slug}/track/${result.orderId}`)
  }

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#888', marginBottom: 16 }}>Your cart is empty.</p>
          <a href={`/menu/${slug}`} style={{ color: '#FF6B00', fontWeight: 700, textDecoration: 'none' }}>← Back to menu</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <a href={`/menu/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
        ← Back to menu
      </a>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 32px', letterSpacing: -0.5 }}>Checkout</h1>

      {/* Order summary */}
      <div style={{ background: '#f9f9f9', borderRadius: 16, padding: 20, marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#333' }}>Order Summary</h3>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
            <span style={{ color: '#444' }}>{item.name} × {item.quantity}</span>
            <span style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 4 }}>
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 8 }}>
            <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 18 }}>
            <span>Total</span><span style={{ color: '#FF6B00' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery details form */}
      <form onSubmit={handleSubmit}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800 }}>Delivery Details</h3>

        {[
          { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'John Smith' },
          { label: 'Phone Number', value: phone, setter: setPhone, type: 'tel', placeholder: '+1 555 0123' },
          { label: 'Delivery Address', value: address, setter: setAddress, type: 'text', placeholder: '123 Main St, City' },
        ].map(({ label, value, setter, type, placeholder }) => (
          <div key={label} style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>{label}</label>
            <input
              type={type}
              value={value}
              onChange={e => setter(e.target.value)}
              placeholder={placeholder}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #e0e0e0',
                borderRadius: 10,
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
            />
          </div>
        ))}

        {error && <p style={{ color: '#e53e3e', fontSize: 14, marginBottom: 12 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading ? '#ccc' : '#FF6B00',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            marginTop: 8,
          }}
        >
          {loading ? 'Placing order…' : `Place Order · $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  )
}
