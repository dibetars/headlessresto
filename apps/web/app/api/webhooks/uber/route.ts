import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

const WEBHOOK_SECRET = process.env.UBER_DIRECT_WEBHOOK_SECRET

/**
 * Verify Uber Direct webhook signature.
 * Uber sends HMAC-SHA256 of the raw body signed with the webhook secret.
 * Returns false (hard fail) when the secret is not configured.
 */
function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    return false
  }
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-uber-signature') || ''

  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 401 })
  }

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const deliveryId: string = payload?.data?.id || payload?.delivery_id || ''
  const status: string = payload?.data?.status || payload?.status || ''
  const trackingUrl: string = payload?.data?.tracking_url || ''
  const driver = payload?.data?.courier || payload?.data?.driver || null

  if (deliveryId && status) {
    try {
      const adminSupabase = createAdminClient()
      await adminSupabase.from('delivery_orders').upsert(
        {
          delivery_id: deliveryId,
          status,
          tracking_url: trackingUrl || null,
          driver_name: driver?.name || null,
          driver_rating: driver?.rating || null,
          driver_photo_url: driver?.picture_url || null,
          driver_vehicle: driver?.vehicle_make_model || null,
          driver_license_plate: driver?.license_plate || null,
          raw_payload: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'delivery_id' }
      )
    } catch (err) {
      // Log but do not fail — Uber expects 200 immediately
      console.error('delivery_orders upsert error:', err)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
