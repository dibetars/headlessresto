import { getPublicOrderAction } from '@/app/auth/actions/public-orders'
import { notFound } from 'next/navigation'
import { DeliveryMap } from '@/components/DeliveryMap'

const ORDER_STEPS = [
  { key: 'pending',   label: 'Order Received',  emoji: '📋' },
  { key: 'preparing', label: 'Being Prepared',   emoji: '👨‍🍳' },
  { key: 'ready',     label: 'Ready for Pickup', emoji: '✅' },
  { key: 'completed', label: 'Delivered',         emoji: '🎉' },
]

const DELIVERY_STEPS = [
  { key: 'pending',        label: 'Finding Driver',           emoji: '🔍' },
  { key: 'pickup',         label: 'Driver Heading to Us',     emoji: '🚗' },
  { key: 'pickup_complete',label: 'Order Picked Up',          emoji: '📦' },
  { key: 'dropoff',        label: 'On the Way to You',        emoji: '🛵' },
  { key: 'delivered',      label: 'Delivered!',               emoji: '🎉' },
]

export const revalidate = 30  // re-fetch every 30s via ISR

export default async function TrackOrderPage({
  params,
}: {
  params: { slug: string; orderId: string }
}) {
  const order = await getPublicOrderAction(params.orderId)
  if (!order) notFound()

  const shortId = order.id.split('-')[0].toUpperCase()

  const orderIdx = ORDER_STEPS.findIndex(s => s.key === order.status)
  const activeOrderIdx = orderIdx === -1 ? 0 : orderIdx

  const { delivery } = order
  const deliveryIdx = delivery
    ? DELIVERY_STEPS.findIndex(s => s.key === delivery.status)
    : -1
  const activeDeliveryIdx = deliveryIdx === -1 ? 0 : deliveryIdx

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
        #{shortId}
      </p>

      {/* Kitchen status */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Kitchen</h3>
      <div style={{ marginBottom: 36 }}>
        {ORDER_STEPS.map((step, idx) => {
          const done = idx <= activeOrderIdx
          const isActive = idx === activeOrderIdx
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
              {idx < ORDER_STEPS.length - 1 && (
                <div style={{ position: 'absolute', left: 19, top: 40, width: 2, height: 32, background: idx < activeOrderIdx ? '#FF6B00' : '#eee' }} />
              )}
              <div style={{ width: 40, height: 40, borderRadius: 999, background: done ? '#FF6B00' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: isActive ? '0 0 0 4px rgba(255,107,0,0.18)' : 'none', zIndex: 1 }}>
                {step.emoji}
              </div>
              <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                <p style={{ margin: 0, fontWeight: done ? 700 : 500, fontSize: 15, color: done ? '#111' : '#bbb' }}>
                  {step.label}
                  {isActive && (
                    <span style={{ marginLeft: 8, fontSize: 11, background: '#FF6B00', color: '#fff', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>
                      Now
                    </span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delivery status */}
      {delivery && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Delivery</h3>
          <div style={{ marginBottom: 28 }}>
            {DELIVERY_STEPS.map((step, idx) => {
              const done = idx <= activeDeliveryIdx
              const isActive = idx === activeDeliveryIdx
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
                  {idx < DELIVERY_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: 19, top: 40, width: 2, height: 32, background: idx < activeDeliveryIdx ? '#FF6B00' : '#eee' }} />
                  )}
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: done ? '#FF6B00' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: isActive ? '0 0 0 4px rgba(255,107,0,0.18)' : 'none', zIndex: 1 }}>
                    {step.emoji}
                  </div>
                  <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                    <p style={{ margin: 0, fontWeight: done ? 700 : 500, fontSize: 15, color: done ? '#111' : '#bbb' }}>
                      {step.label}
                      {isActive && (
                        <span style={{ marginLeft: 8, fontSize: 11, background: '#FF6B00', color: '#fff', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>
                          Now
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Driver info + tracking link */}
          {delivery.driverName && (
            <div style={{ background: '#FFF7F0', border: '1.5px solid #FFD9B8', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#333', fontSize: 15 }}>{delivery.driverName}</p>
              {delivery.driverRating && (
                <p style={{ margin: '0 0 4px', color: '#888', fontSize: 13 }}>⭐ {delivery.driverRating} rating</p>
              )}
              {delivery.driverVehicle && (
                <p style={{ margin: 0, color: '#888', fontSize: 13 }}>🚗 {delivery.driverVehicle}</p>
              )}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <DeliveryMap
              mode="live"
              trackingUrl={delivery.trackingUrl ?? undefined}
              primaryColor="#FF6B00"
            />
          </div>
        </>
      )}

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

      {order.customer_address && (
        <div style={{ padding: '14px 18px', border: '1.5px solid #eee', borderRadius: 12, fontSize: 14, color: '#555' }}>
          <span style={{ fontWeight: 600, color: '#333' }}>Delivering to: </span>
          {order.customer_address}
        </div>
      )}
    </div>
  )
}
