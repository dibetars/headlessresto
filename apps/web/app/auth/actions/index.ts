'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserProfile() {
  console.log('DEBUG: getUserProfile called');
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('DEBUG: auth error:', authError);
    return null;
  }

  if (!user) {
    console.log('DEBUG: no user found');
    return null
  }

  console.log('DEBUG: user found:', user.id);

  // Use admin client to bypass RLS issues (like infinite recursion in policies)
  const adminSupabase = createAdminClient()
  
  console.log('DEBUG: fetching profile for user:', user.id);
  const { data: profileData, error: profileError } = await adminSupabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('DEBUG: profile error:', profileError);
    return null
  }

  console.log('DEBUG: profile found:', profileData);

  console.log('DEBUG: fetching membership for user:', user.id);
  const { data: memberships, error: membershipError } = await adminSupabase
    .from('org_memberships')
    .select('*')
    .eq('user_id', user.id)

  if (membershipError) {
    console.error('DEBUG: membership error:', membershipError);
  }

  console.log('DEBUG: memberships found:', memberships);
  const membershipData = memberships && memberships.length > 0 ? memberships[0] : null;

  let organization = null;
  if (membershipData?.org_id) {
    console.log('DEBUG: fetching organization:', membershipData.org_id);
    const { data: orgData } = await adminSupabase
      .from('organizations')
      .select('name')
      .eq('id', membershipData.org_id)
      .single();
    organization = orgData;
  }

  const finalRole = membershipData?.role || 'user';
  console.log('DEBUG: final profile being returned with role:', finalRole);

  return {
    ...profileData,
    role: finalRole,
    organization: organization
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  console.log('DEBUG: signIn attempt for:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('DEBUG: signIn error:', error.message);
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  console.log('DEBUG: signIn success for:', data.user?.id);
  return redirect('/dashboard')
}

export async function signUp(formData: FormData) {
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
      role: 'admin' // Using your existing schema's roles if applicable
    })

  return redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
