'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminRole, getCurrentUserOrgId } from './_helpers'

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

export async function updateTableAction(
  id: string,
  data: { table_number?: string; capacity?: number; status?: string }
) {
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
