'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminRole, getCurrentUserOrgId } from './_helpers'

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

export async function adjustStockAction(
  id: string,
  quantityChange: number,
  reason: string,
  currentQuantity: number
) {
  await assertAdminRole()
  const adminSupabase = createAdminClient()
  const newQuantity = currentQuantity + quantityChange
  const { error: updateError } = await adminSupabase
    .from('stock_items')
    .update({ quantity: newQuantity })
    .eq('id', id)
  if (updateError) throw updateError
  // Log movement if table exists (silently skip if not)
  await adminSupabase.from('stock_movements').insert({
    stock_item_id: id,
    quantity_change: quantityChange,
    reason,
  }).then(() => {})
}
