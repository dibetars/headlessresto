'use server'

import { createAdminClient } from '@/lib/supabase/server'

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
    .select('id')
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

  return { orderId: order.id }
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

  return order
}
