// Uber Direct API client (white-label delivery, not Uber Eats marketplace)
// Docs: https://developer.uber.com/docs/deliveries/introduction

const UBER_AUTH_URL = 'https://auth.uber.com/oauth/v2/token'
const UBER_API_BASE = 'https://api.uber.com'

const CUSTOMER_ID = process.env.UBER_DIRECT_CUSTOMER_ID
const CLIENT_ID = process.env.UBER_DIRECT_CLIENT_ID
const CLIENT_SECRET = process.env.UBER_DIRECT_CLIENT_SECRET

export const DEMO_MODE = !CUSTOMER_ID || !CLIENT_ID || !CLIENT_SECRET

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UberAddress {
  street_address: string[]
  city: string
  state: string
  zip_code: string
  country: string
}

export interface UberContactInfo {
  name: string
  phone_number: string
}

export interface DeliveryQuoteParams {
  pickup_address: string
  dropoff_address: string
}

export interface CreateDeliveryParams {
  pickup_address: string
  pickup_name: string
  pickup_phone_number: string
  dropoff_address: string
  dropoff_name: string
  dropoff_phone_number: string
  manifest_description?: string
}

export interface DeliveryQuote {
  id: string
  created: number
  expires: number
  fee: number
  currency: string
  estimated_pickup: number
  estimated_dropoff: number
}

export interface DeliveryDriver {
  name: string
  rating: string
  picture_url?: string
  vehicle_make_model?: string
  vehicle_type?: string
  license_plate?: string
}

export interface Delivery {
  id: string
  status: 'pending' | 'pickup' | 'pickup_complete' | 'dropoff' | 'delivered' | 'cancelled' | 'returned'
  tracking_url: string
  fee: number
  currency: string
  estimated_pickup: number
  estimated_dropoff: number
  driver?: DeliveryDriver
  courier?: DeliveryDriver
}

// ─── Token cache ─────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
    scope: 'eats.deliveries',
  })

  const res = await fetch(UBER_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Uber auth failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return cachedToken.token
}

async function uberRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getAccessToken()
  const url = `${UBER_API_BASE}${path}`

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Uber Direct API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

// ─── Demo mode mock helpers ───────────────────────────────────────────────────

function mockDeliveryId() {
  return `demo_${Math.random().toString(36).slice(2, 10)}`
}

function mockQuote(): DeliveryQuote {
  const now = Math.floor(Date.now() / 1000)
  return {
    id: mockDeliveryId(),
    created: now,
    expires: now + 300,
    fee: 599,
    currency: 'USD',
    estimated_pickup: now + 600,
    estimated_dropoff: now + 1500,
  }
}

function mockDelivery(status: Delivery['status'] = 'pending'): Delivery {
  const now = Math.floor(Date.now() / 1000)
  return {
    id: mockDeliveryId(),
    status,
    tracking_url: 'https://track.uber.com/demo-track',
    fee: 599,
    currency: 'USD',
    estimated_pickup: now + 600,
    estimated_dropoff: now + 1500,
    courier: {
      name: 'Marcus R.',
      rating: '4.92',
      vehicle_make_model: 'Toyota Prius',
      vehicle_type: 'car',
      license_plate: 'ABC-1234',
    },
  }
}

/** Returns a simulated delivery status based on elapsed time since creation */
export function simulateDemoStatus(createdAt: string): Delivery['status'] {
  const elapsed = Date.now() - new Date(createdAt).getTime()
  const minutes = elapsed / 60_000
  if (minutes < 1) return 'pending'
  if (minutes < 3) return 'pickup'
  if (minutes < 5) return 'pickup_complete'
  if (minutes < 10) return 'dropoff'
  return 'delivered'
}

// ─── API methods ──────────────────────────────────────────────────────────────

/**
 * Get a delivery price quote without committing.
 * POST /v1/customers/{customer_id}/deliveries/quote
 */
export async function createDeliveryQuote(params: DeliveryQuoteParams): Promise<DeliveryQuote> {
  if (DEMO_MODE) return mockQuote()

  return uberRequest<DeliveryQuote>(
    'POST',
    `/v1/customers/${CUSTOMER_ID}/deliveries/quote`,
    {
      pickup_address: params.pickup_address,
      dropoff_address: params.dropoff_address,
    }
  )
}

/**
 * Create and dispatch an actual delivery.
 * POST /v1/customers/{customer_id}/deliveries
 */
export async function createDelivery(params: CreateDeliveryParams): Promise<Delivery> {
  if (DEMO_MODE) return mockDelivery('pending')

  return uberRequest<Delivery>(
    'POST',
    `/v1/customers/${CUSTOMER_ID}/deliveries`,
    {
      pickup_address: params.pickup_address,
      pickup_name: params.pickup_name,
      pickup_phone_number: params.pickup_phone_number,
      dropoff_address: params.dropoff_address,
      dropoff_name: params.dropoff_name,
      dropoff_phone_number: params.dropoff_phone_number,
      manifest_description: params.manifest_description || 'Restaurant order',
    }
  )
}

/**
 * Get status and tracking info for an existing delivery.
 * GET /v1/customers/{customer_id}/deliveries/{delivery_id}
 */
export async function getDelivery(deliveryId: string): Promise<Delivery> {
  if (DEMO_MODE) {
    // Simulate progressive status based on the dummy timestamp in the ID
    const delivery = mockDelivery('pickup')
    delivery.id = deliveryId
    return delivery
  }

  return uberRequest<Delivery>(
    'GET',
    `/v1/customers/${CUSTOMER_ID}/deliveries/${deliveryId}`
  )
}

/**
 * Cancel an in-progress delivery.
 * POST /v1/customers/{customer_id}/deliveries/{delivery_id}/cancel
 */
export async function cancelDelivery(deliveryId: string): Promise<void> {
  if (DEMO_MODE) return

  await uberRequest<void>(
    'POST',
    `/v1/customers/${CUSTOMER_ID}/deliveries/${deliveryId}/cancel`
  )
}
