'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { profileSchema, restaurantSchema } from '@/lib/validators'

export async function saveProfileAction(data: {
  full_name?: string
  email?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { full_name, email } = parsed.data

  // Update profile metadata
  const updates: Record<string, unknown> = {}
  if (full_name !== undefined) updates.full_name = full_name

  if (Object.keys(updates).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

    if (profileError) {
      return { success: false, error: profileError.message }
    }
  }

  // Update auth email if provided (requires admin client)
  if (email && email !== user.email) {
    const adminClient = createAdminClient()
    const { error: emailError } = await adminClient.auth.admin.updateUserById(user.id, { email })
    if (emailError) {
      return { success: false, error: emailError.message }
    }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function saveRestaurantSettingsAction(data: {
  name?: string
  currency?: string
  timezone?: string
  tax_rate?: number
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = restaurantSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  // Look up the organisation this user belongs to
  const { data: memberRow, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (memberError) {
    return { success: false, error: memberError.message }
  }

  if (!memberRow) {
    return { success: false, error: 'No restaurant found for this account' }
  }

  const { error: updateError } = await supabase
    .from('organizations')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', memberRow.organization_id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function saveNotificationsAction(data: {
  notifications: Record<string, boolean>
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error: upsertError } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      notifications: data.notifications,
      updated_at: new Date().toISOString(),
    })

  if (upsertError) {
    return { success: false, error: upsertError.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
