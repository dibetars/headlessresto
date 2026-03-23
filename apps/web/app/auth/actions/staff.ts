'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminRole, getCurrentUserOrgId } from './_helpers'

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
