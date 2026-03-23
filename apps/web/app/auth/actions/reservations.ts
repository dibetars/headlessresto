'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth, getCurrentUserOrgId } from './_helpers'

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
