import { getPublicOrderAction } from '@/app/auth/actions/public-orders'
import { notFound } from 'next/navigation'

const STATUS_STEPS = [
  { key: 'pending',   label: 'Order Received',    emoji: '📋' },
  { key: 'preparing', label: 'Being Prepared',     emoji: '👨‍🍳' },
  { key: 'ready',     label: 'Ready for Pickup',   emoji: '✅' },
  { key: 'completed', label: 'Delivered',           emoji: '🎉' },
]

export default async function TrackOrderPage({
  params,
}: {
  params: { slug: string; orderId: string }
}) {
  const order = await getPublicOrderAction(params.orderId)
  if (!order) notFound()

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
  const activeIndex = currentIndex === -1 ? 0 : currentIndex

  const shortId = order.id.split('-')[0].toUpperCase()

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <a
        href={`/menu/${params.slug}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}
      >
        ← Back to menu
      </a>

      <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px', letterSpacing: -0.5 }}>Track Your Order</h1>
      <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 36px', fontFamily: 'monospace' }}>
        Order #{shortId}
      </p>

      {/* Status timeline */}
      <div style={{ marginBottom: 40 }}>
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= activeIndex
          const isActive = idx === activeIndex
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: idx < STATUS_STEPS.length - 1 ? 0 : 0, position: 'relative' }}>
              {/* Connector line */}
              {idx < STATUS_STEPS.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: 19,
                  top: 40,
                  width: 2,
                  height: 32,
                  background: idx < activeIndex ? '#FF6B00' : '#eee',
                  transition: 'background 0.3s',
                }} />
              )}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: done ? '#FF6B00' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
                boxShadow: isActive ? '0 0 0 4px rgba(255,107,0,0.2)' : 'none',
                transition: 'all 0.3s',
                zIndex: 1,
              }}>
                {step.emoji}
              </div>
              <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                <p style={{
                  margin: 0,
                  fontWeight: done ? 700 : 500,
                  fontSize: 15,
                  color: done ? '#111' : '#bbb',
                }}>
                  {step.label}
                  {isActive && (
                    <span style={{ marginLeft: 8, fontSize: 12, background: '#FF6B00', color: '#fff', borderRadius: 999, padding: '2px 8px', fontWeight: 600 }}>
                      Current
                    </span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order items */}
      <div style={{ background: '#f9f9f9', borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#333' }}>Items</h3>
        {(order.order_items as any[]).map((item: any) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
            <span style={{ color: '#444' }}>{item.menu_items?.name} × {item.quantity}</span>
            <span style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 18 }}>
          <span>Total</span>
          <span style={{ color: '#FF6B00' }}>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery address */}
      {order.customer_address && (
        <div style={{ padding: '14px 18px', border: '1.5px solid #eee', borderRadius: 12, fontSize: 14, color: '#555' }}>
          <span style={{ fontWeight: 600, color: '#333' }}>Delivering to: </span>
          {order.customer_address}
        </div>
      )}
    </div>
  )
}
