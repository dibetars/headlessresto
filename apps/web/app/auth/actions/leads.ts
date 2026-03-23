'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

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
  const { allowed } = await rateLimit(`lead:${ip}`, 3, 10 * 60_000)
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
