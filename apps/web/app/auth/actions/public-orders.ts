'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { createDeliveryQuote, createDelivery, simulateDemoStatus, DEMO_MODE } from '@/lib/uber-direct'

export async function getDeliveryQuoteAction(
  deliveryAddress: string,
  slug: string
): Promise<{ fee: number; currency: string; etaMinutes: number } | { error: string }> {
  try {
    const adminClient = createAdminClient()
    const { data: org } = await adminClient
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    const pickupAddress = process.env.RESTAURANT_ADDRESS || '123 Main St, San Francisco, CA 94105'
    const quote = await createDeliveryQuote({
      pickup_address: pickupAddress,
      dropoff_address: deliveryAddress || '456 Any St, San Francisco, CA',
    })

    const now = Math.floor(Date.now() / 1000)
    const etaMinutes = Math.round((quote.estimated_dropoff - now) / 60)

    return {
      fee: quote.fee,           // in cents
      currency: quote.currency,
      etaMinutes,
    }
  } catch (err: any) {
    return { error: err.message ?? 'Could not get delivery quote' }
  }
}

export async function placePublicOrderAction(data: {
  slug: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: { id: string; name: string; price: number; quantity: number }[]
  total: number
}): Promise<{ orderId: string } | { error: string }> {
  const adminClient = createAdminClient()

  const { data: org, error: orgError } = await adminClient
    .from('organizations')
    .select('id, name')
    .eq('slug', data.slug)
    .maybeSingle()

  if (orgError || !org) {
    return { error: 'Restaurant not found' }
  }

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      org_id: org.id,
      type: 'delivery',
      status: 'pending',
      total: data.total,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_address: data.customerAddress,
      payment_status: 'pending',
    })
    .select()
    .single()

  if (orderError || !order) {
    return { error: orderError?.message ?? 'Failed to create order' }
  }

  const orderItems = data.items.map(item => ({
    order_id: order.id,
    menu_item_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await adminClient
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    return { error: itemsError.message }
  }

  // Auto-dispatch delivery (fire-and-forget — don't block order confirmation)
  dispatchDelivery(order.id, org.name, data).catch(err =>
    console.error('Auto-dispatch failed for order', order.id, err)
  )

  return { orderId: order.id }
}

async function dispatchDelivery(
  orderId: string,
  orgName: string,
  data: {
    customerName: string
    customerPhone: string
    customerAddress: string
    items: { id: string; name: string; price: number; quantity: number }[]
  }
) {
  const adminClient = createAdminClient()
  const pickupAddress = process.env.RESTAURANT_ADDRESS || '123 Main St, San Francisco, CA 94105'
  const pickupPhone = process.env.RESTAURANT_PHONE || '+15555550000'

  const delivery = await createDelivery({
    pickup_address: pickupAddress,
    pickup_name: orgName,
    pickup_phone_number: pickupPhone,
    dropoff_address: data.customerAddress,
    dropoff_name: data.customerName,
    dropoff_phone_number: data.customerPhone,
    manifest_description: `Order #${orderId.slice(0, 8).toUpperCase()} — ${data.items.length} item(s)`,
  })

  await adminClient.from('delivery_orders').insert({
    order_id: orderId,
    delivery_id: delivery.id,
    status: delivery.status,
    tracking_url: delivery.tracking_url ?? null,
    driver_name: delivery.courier?.name ?? null,
    driver_rating: delivery.courier?.rating ?? null,
    driver_photo_url: delivery.courier?.picture_url ?? null,
    driver_vehicle: delivery.courier?.vehicle_make_model ?? null,
    driver_license_plate: delivery.courier?.license_plate ?? null,
  })
}

export async function getPublicOrderAction(orderId: string) {
  const adminClient = createAdminClient()

  const { data: order } = await adminClient
    .from('orders')
    .select(`
      id, status, total, created_at, customer_name, customer_address,
      order_items (
        id, quantity, price,
        menu_items ( name )
      )
    `)
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return null

  const { data: deliveryRow } = await adminClient
    .from('delivery_orders')
    .select('delivery_id, status, tracking_url, driver_name, driver_rating, driver_vehicle, created_at')
    .eq('order_id', orderId)
    .maybeSingle()

  let deliveryStatus = deliveryRow?.status ?? null

  // In demo mode, simulate progressive status
  if (DEMO_MODE && deliveryRow) {
    deliveryStatus = simulateDemoStatus(deliveryRow.created_at)
  }

  return {
    ...order,
    delivery: deliveryRow
      ? {
          status: deliveryStatus,
          trackingUrl: deliveryRow.tracking_url,
          driverName: deliveryRow.driver_name,
          driverRating: deliveryRow.driver_rating,
          driverVehicle: deliveryRow.driver_vehicle,
        }
      : null,
  }
}
