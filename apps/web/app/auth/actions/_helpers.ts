'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export const ADMIN_ROLES = ['owner', 'admin', 'manager', 'restaurant_admin', 'super_admin']

export async function requireAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function assertAdminRole() {
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

export async function getCurrentUserOrgId(): Promise<string | null> {
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
