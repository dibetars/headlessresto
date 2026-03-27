'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { getCurrentUserOrgId } from './_helpers'

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

  // If no profile row exists yet, fall back to auth user data
  const baseProfile = profileData ?? {
    id: user.id,
    email: user.email ?? '',
    full_name: (user.user_metadata?.full_name as string) ?? '',
    phone: user.phone ?? '',
    avatar_url: null,
    created_at: user.created_at,
  }

  return {
    ...baseProfile,
    role: finalRole,
    organization,
  }
}

export async function signIn(formData: FormData) {
  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const { allowed } = await rateLimit(`signIn:${ip}`, 5, 60_000)
  if (!allowed) return redirect(`/login?error=${encodeURIComponent('Too many attempts. Please wait a minute.')}`)

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('signIn error:', error.message)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const { allowed } = await rateLimit(`signUp:${ip}`, 3, 60 * 60_000)
  if (!allowed) return redirect(`/signup?error=${encodeURIComponent('Too many sign-up attempts. Please try again later.')}`)

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const restaurantName = formData.get('restaurantName') as string
  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

  if (authError || !authData.user) {
    return redirect('/signup?error=' + (authError?.message || 'Could not sign up user'))
  }

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

  await supabase
    .from('org_memberships')
    .insert({ org_id: org.id, user_id: authData.user.id, role: 'owner' })

  return redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect('/login')
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
