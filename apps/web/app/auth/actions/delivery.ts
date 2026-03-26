'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminRole } from './_helpers'

export async function createDeliveryQuoteAction(
  orderId: string,
  deliveryAddress: string
): Promise<{ success: boolean; quote?: any; error?: string }> {
  await assertAdminRole()
  try {
    const { createDeliveryQuote } = await import('@/lib/uber-direct')
    const pickupAddress = process.env.RESTAURANT_ADDRESS || '123 Main St, San Francisco, CA 94105'
    const quote = await createDeliveryQuote({
      pickup_address: pickupAddress,
      dropoff_address: deliveryAddress,
    })
    return { success: true, quote }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get delivery quote' }
  }
}

export async function dispatchDeliveryAction(
  orderId: string,
  deliveryAddress: string,
  customerName: string,
  customerPhone: string
): Promise<{ success: boolean; delivery?: any; error?: string }> {
  await assertAdminRole()
  try {
    const { createDelivery } = await import('@/lib/uber-direct')
    const pickupAddress = process.env.RESTAURANT_ADDRESS || '123 Main St, San Francisco, CA 94105'
    const pickupPhone = process.env.RESTAURANT_PHONE || '+15555550000'
    const pickupName = process.env.RESTAURANT_NAME || 'HeadlessResto'

    const delivery = await createDelivery({
      pickup_address: pickupAddress,
      pickup_name: pickupName,
      pickup_phone_number: pickupPhone,
      dropoff_address: deliveryAddress,
      dropoff_name: customerName,
      dropoff_phone_number: customerPhone,
      manifest_description: `Order #${orderId.slice(0, 8).toUpperCase()}`,
    })

    const adminSupabase = createAdminClient()
    await adminSupabase
      .from('delivery_orders')
      .upsert(
        {
          delivery_id: delivery.id,
          order_id: orderId,
          status: delivery.status,
          tracking_url: delivery.tracking_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'delivery_id' }
      )

    return { success: true, delivery }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch delivery' }
  }
}

export async function getDeliveryStatusAction(
  deliveryId: string
): Promise<{ success: boolean; status?: string; trackingUrl?: string; driver?: any; error?: string }> {
  await assertAdminRole()
  try {
    const { getDelivery } = await import('@/lib/uber-direct')
    const delivery = await getDelivery(deliveryId)
    return {
      success: true,
      status: delivery.status,
      trackingUrl: delivery.tracking_url,
      driver: delivery.courier || delivery.driver || null,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get delivery status' }
  }
}

export async function cancelDeliveryAction(
  deliveryId: string
): Promise<{ success: boolean; error?: string }> {
  await assertAdminRole()
  try {
    const { cancelDelivery } = await import('@/lib/uber-direct')
    await cancelDelivery(deliveryId)

    const adminSupabase = createAdminClient()
    await adminSupabase
      .from('delivery_orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('delivery_id', deliveryId)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to cancel delivery' }
  }
}
