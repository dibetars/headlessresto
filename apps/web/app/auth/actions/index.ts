'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

export async function getUserProfile() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('getUserProfile: auth error:', authError)
    return null
  }

  if (!user) {
    return null
  }

  // Use admin client to bypass RLS issues (like infinite recursion in policies)
  const adminSupabase = createAdminClient()

  const { data: profileData, error: profileError } = await adminSupabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('getUserProfile: profile error:', profileError)
    return null
  }

  // No profile row found — return null instead of granting a default admin role
  if (!profileData) {
    return null
  }

  const { data: memberships, error: membershipError } = await adminSupabase
    .from('org_memberships')
    .select('*')
    .eq('user_id', user.id)

  if (membershipError) {
    console.error('getUserProfile: membership error:', membershipError)
  }

  const membershipData = memberships && memberships.length > 0 ? memberships[0] : null

  let organization = null
  if (membershipData?.org_id) {
    const { data: orgData } = await adminSupabase
      .from('organizations')
      .select('name, brand_assets')
      .eq('id', membershipData.org_id)
      .single()
    organization = orgData
  }

  const finalRole = membershipData?.role || 'user'

  return {
    ...profileData,
    role: finalRole,
    organization: organization
  }
}

export async function signIn(formData: FormData) {
  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const { allowed } = await rateLimit(`signIn:${ip}`, 5, 60_000) // 5 attempts per minute
  if (!allowed) return redirect(`/login?error=${encodeURIComponent('Too many attempts. Please wait a minute.')}`)

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('signIn error:', error.message)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const { allowed } = await rateLimit(`signUp:${ip}`, 3, 60 * 60_000) // 3 sign-ups per hour
  if (!allowed) return redirect(`/signup?error=${encodeURIComponent('Too many sign-up attempts. Please try again later.')}`)

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const restaurantName = formData.get('restaurantName') as string
  const supabase = createClient()

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return redirect('/signup?error=' + (authError?.message || 'Could not sign up user'))
  }

  // 2. Create the restaurant (using service role would be better for some logic, 
  // but let's stick to client for now if RLS allows or handle it via a trigger/function)
  // 2. Create the organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: restaurantName,
      slug: restaurantName.toLowerCase().replace(/\s+/g, '-'),
      owner_user_id: authData.user.id
    })
    .select()
    .single()

  if (orgError) {
    return redirect('/signup?error=' + orgError.message)
  }

  // 3. Create the user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      full_name: email.split('@')[0],
      email: email
    })

  if (profileError) {
    return redirect('/signup?error=' + profileError.message)
  }

  // 4. Create membership
  const { error: membershipError } = await supabase
    .from('org_memberships')
    .insert({
      org_id: org.id,
      user_id: authData.user.id,
      role: 'owner'
    })

  return redirect('/dashboard')
}

export async function getDashboardStats() {
  const orgId = await getCurrentUserOrgId()
  if (!orgId) return []
  const adminSupabase = createAdminClient()

  const { data: orders } = await adminSupabase
    .from('orders')
    .select(`
      total,
      status,
      created_at,
      order_items (
        quantity,
        menu_items (
          name,
          price
        )
      )
    `)
    .eq('org_id', orgId)

  return orders || []
}

// ─── Super Admin ────────────────────────────────────────────────

export async function getOrganizations() {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('organizations')
    .select('id, name, slug, brand_assets, created_at, owner_user_id')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getPlatformStats() {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const [orgsRes, ordersRes, usersRes] = await Promise.all([
    adminSupabase.from('organizations').select('id', { count: 'exact', head: true }),
    adminSupabase.from('orders').select('total, status'),
    adminSupabase.from('users').select('id', { count: 'exact', head: true }),
  ])
  const orders = ordersRes.data || []
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + (o.total || 0), 0)
  return {
    totalOrganizations: orgsRes.count || 0,
    totalOrders: orders.length,
    totalRevenue,
    totalUsers: usersRes.count || 0,
  }
}

export async function setOrganizationFeature(orgId: string, feature: string, enabled: boolean) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const { data: org } = await adminSupabase
    .from('organizations')
    .select('brand_assets')
    .eq('id', orgId)
    .single()
  const currentAssets = org?.brand_assets || {}
  const currentFeatures = currentAssets.features || {}
  const { error } = await adminSupabase
    .from('organizations')
    .update({
      brand_assets: { ...currentAssets, features: { ...currentFeatures, [feature]: enabled } },
      updated_at: new Date().toISOString()
    })
    .eq('id', orgId)
  if (error) throw error
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

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
  if (error) throw error
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

const ADMIN_ROLES = ['owner', 'admin', 'manager', 'restaurant_admin', 'super_admin']

async function requireAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

async function assertAdminRole() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('org_memberships')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (!ADMIN_ROLES.includes(data?.role || '')) throw new Error('Unauthorized: insufficient role')
}

async function getCurrentUserOrgId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('org_memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  return data?.org_id || null
}

// ─── Tables ─────────────────────────────────────────────────────────────────

export async function getTables() {
  const orgId = await getCurrentUserOrgId()
  if (!orgId) return []
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('tables')
    .select('*')
    .eq('org_id', orgId)
    .order('table_number')
  return data || []
}

export async function addTableAction(tableNumber: string, capacity: number) {
  await assertAdminRole()
  const orgId = await getCurrentUserOrgId()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('tables').insert({
    table_number: tableNumber,
    capacity,
    status: 'available',
    org_id: orgId,
  })
  if (error) throw error
}

export async function updateTableAction(id: string, data: { table_number?: string; capacity?: number; status?: string }) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('tables').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteTableAction(id: string) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('tables').delete().eq('id', id)
  if (error) throw error
}

// ─── Reservations ───────────────────────────────────────────────────────────

export async function getReservations() {
  const orgId = await getCurrentUserOrgId()
  if (!orgId) return []
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('reservations')
    .select('*')
    .eq('org_id', orgId)
    .order('reservation_date')
    .order('reservation_time')
  return data || []
}

export async function createReservationAction(reservation: {
  customer_name: string
  customer_email: string
  customer_phone: string
  reservation_date: string
  reservation_time: string
  number_of_guests: number
  status: string
}) {
  await requireAuth()
  const orgId = await getCurrentUserOrgId()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('reservations').insert({ ...reservation, org_id: orgId })
  if (error) throw error
}

export async function updateReservationStatusAction(id: string, status: string) {
  await requireAuth()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('reservations').update({ status }).eq('id', id)
  if (error) throw error
}

// ─── Inventory ──────────────────────────────────────────────────────────────

export async function getInventoryItems() {
  const orgId = await getCurrentUserOrgId()
  if (!orgId) return []
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('stock_items')
    .select('*')
    .eq('org_id', orgId)
    .order('name')
  return data || []
}

export async function addInventoryItemAction(item: {
  name: string
  quantity: number
  unit: string
  category: string
  reorder_threshold: number
  cost_per_unit_cents: number
}) {
  await assertAdminRole()
  const orgId = await getCurrentUserOrgId()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('stock_items').insert({ ...item, org_id: orgId })
  if (error) throw error
}

export async function adjustStockAction(id: string, quantityChange: number, reason: string, currentQuantity: number) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const newQuantity = currentQuantity + quantityChange
  const { error: updateError } = await adminSupabase.from('stock_items').update({ quantity: newQuantity }).eq('id', id)
  if (updateError) throw updateError
  // Log movement if table exists (silently skip if not)
  await adminSupabase.from('stock_movements').insert({
    stock_item_id: id,
    quantity_change: quantityChange,
    reason,
  }).then(() => {})
}

// ─── Staff ──────────────────────────────────────────────────────────────────

export async function getStaffMembers() {
  const orgId = await getCurrentUserOrgId()
  if (!orgId) return []
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('org_memberships')
    .select('id, role, created_at, user_id, users(id, full_name, email)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  return (data || []).map((m: any) => ({
    id: m.id,
    user_id: m.user_id,
    name: m.users?.full_name || m.users?.email || 'Unknown',
    email: m.users?.email || '',
    role: m.role,
    is_approved: true,
    created_at: m.created_at,
  }))
}

export async function updateStaffRoleAction(membershipId: string, role: string) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('org_memberships').update({ role }).eq('id', membershipId)
  if (error) throw error
}

export async function removeStaffMemberAction(membershipId: string) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('org_memberships').delete().eq('id', membershipId)
  if (error) throw error
}

export async function placeOrderAction(
  tableId: string,
  cartItems: { id: string; quantity: number; price: number }[],
  total: number,
  existingOrderId?: string
) {
  await requireAuth()
  const adminSupabase = createAdminClient()
  let orderId = existingOrderId

  if (!orderId) {
    const { data: order, error } = await adminSupabase
      .from('orders')
      .insert({ status: 'pending', total, table_id: tableId, type: 'dine_in' })
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

export async function dismissServiceCallAction(id: string) {
  await requireAuth()
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('service_calls').update({ status: 'dismissed' }).eq('id', id)
  if (error) throw error
}

// ─── Lead Capture ────────────────────────────────────────────────────────────
// Requires a `leads` table in Supabase. Suggested schema:
//   id uuid pk default gen_random_uuid()
//   restaurant_name text, contact_person text, email text, phone text
//   num_locations text, plan_interest text, team_size text
//   preferred_time text, message text, current_system text
//   integration_needs text, source text, status text default 'new'
//   created_at timestamptz default now()

export async function submitLeadAction(data: {
  restaurantName: string
  contactPerson: string
  email: string
  phone?: string
  numLocations?: string
  planInterest?: string
  teamSize?: string
  preferredTime?: string
  message?: string
  currentSystem?: string
  integrationNeeds?: string
  source?: string
}): Promise<{ success: boolean; error?: string }> {
  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const { allowed } = await rateLimit(`lead:${ip}`, 3, 10 * 60_000) // 3 per 10 minutes
  if (!allowed) return { success: false, error: 'Too many submissions. Please try again in a few minutes.' }

  try {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('leads').insert({
      restaurant_name: data.restaurantName,
      contact_person: data.contactPerson,
      email: data.email,
      phone: data.phone || null,
      num_locations: data.numLocations || null,
      plan_interest: data.planInterest || null,
      team_size: data.teamSize || null,
      preferred_time: data.preferredTime || null,
      message: data.message || null,
      current_system: data.currentSystem || null,
      integration_needs: data.integrationNeeds || null,
      source: data.source || 'website',
      status: 'new',
    })
    if (error) throw error
    return { success: true }
  } catch {
    return { success: false, error: 'Unable to submit. Please email us directly.' }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}

// ─── Uber Direct Delivery Actions ────────────────────────────────────────────

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

    // Persist delivery reference on the order
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
