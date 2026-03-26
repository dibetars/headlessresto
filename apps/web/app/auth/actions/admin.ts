'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminRole } from './_helpers'

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
  const currentFeatures = (currentAssets as any).features || {}
  const { error } = await adminSupabase
    .from('organizations')
    .update({
      brand_assets: { ...currentAssets, features: { ...currentFeatures, [feature]: enabled } },
      updated_at: new Date().toISOString()
    })
    .eq('id', orgId)
  if (error) throw error
}
