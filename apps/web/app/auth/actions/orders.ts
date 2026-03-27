'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth, assertAdminRole, getCurrentUserOrgId } from './_helpers'

export async function getOrders() {
  const orgId = await getCurrentUserOrgId()
  if (!orgId) return []
  const adminSupabase = createAdminClient()
  const { data: orders } = await adminSupabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price,
        menu_items (
          name,
          category
        )
      )
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  return orders || []
}

export async function getKDSOrders() {
  const orgId = await getCurrentUserOrgId()
  if (!orgId) return []
  const adminSupabase = createAdminClient()
  const { data: orders } = await adminSupabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      table_id,
      order_items (
        id,
        quantity,
        menu_items (
          name,
          category
        )
      )
    `)
    .eq('org_id', orgId)
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true })
  return orders || []
}

export async function placeOrderAction(
  tableId: string,
  cartItems: { id: string; quantity: number; price: number }[],
  total: number,
  existingOrderId?: string
) {
  await requireAuth()
  const orgId = await getCurrentUserOrgId()
  const adminSupabase = createAdminClient()
  let orderId = existingOrderId

  if (!orderId) {
    const { data: order, error } = await adminSupabase
      .from('orders')
      .insert({ status: 'pending', total, table_id: tableId, type: 'dine_in', org_id: orgId })
      .select()
      .single()
    if (error) throw error
    orderId = order.id
  } else {
    const { error } = await adminSupabase.from('orders').update({ total }).eq('id', orderId)
    if (error) throw error
  }

  const items = cartItems.map(item => ({
    order_id: orderId,
    menu_item_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }))
  const { error: itemsError } = await adminSupabase.from('order_items').insert(items)
  if (itemsError) throw itemsError

  return orderId
}

export async function checkoutOrderAction(
  tableId: string | null,
  cartItems: { id: string; quantity: number; price: number }[],
  total: number,
  paymentMethod: string,
  existingOrderId?: string
) {
  await requireAuth()
  const orgId = await getCurrentUserOrgId()
  const adminSupabase = createAdminClient()
  let orderId = existingOrderId

  if (cartItems.length > 0 && !orderId) {
    const { data: order, error } = await adminSupabase
      .from('orders')
      .insert({
        status: 'completed',
        total,
        table_id: tableId,
        payment_status: 'paid',
        payment_method: paymentMethod,
        type: 'dine_in',
        org_id: orgId,
      })
      .select()
      .single()
    if (error) throw error
    orderId = order.id

    const items = cartItems.map(item => ({
      order_id: orderId,
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))
    const { error: itemsError } = await adminSupabase.from('order_items').insert(items)
    if (itemsError) throw itemsError
  } else if (orderId) {
    if (cartItems.length > 0) {
      const items = cartItems.map(item => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))
      const { error: itemsError } = await adminSupabase.from('order_items').insert(items)
      if (itemsError) throw itemsError
    }
    const { error } = await adminSupabase
      .from('orders')
      .update({ status: 'completed', total, payment_status: 'paid', payment_method: paymentMethod })
      .eq('id', orderId)
    if (error) throw error
  }
}

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  await requireAuth()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
  if (error) throw error
}

export async function dismissServiceCallAction(id: string) {
  await requireAuth()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('service_calls').update({ status: 'dismissed' }).eq('id', id)
  if (error) throw error
}
