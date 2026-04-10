import { createClient, createAdminClient } from '@/lib/supabase/server'
import StorefrontClient from './StorefrontClient'
import { redirect } from 'next/navigation'

export default async function StorefrontPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminClient = createAdminClient()

  const { data: memberRow } = await adminClient
    .from('org_memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!memberRow?.org_id) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No organisation found for your account.</p>
      </div>
    )
  }

  const { data: org } = await adminClient
    .from('organizations')
    .select('id, name, slug, brand_assets')
    .eq('id', memberRow.org_id)
    .maybeSingle()

  if (!org) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Organisation not found.</p>
      </div>
    )
  }

  const brandAssets = (org.brand_assets as any) ?? {}

  return (
    <StorefrontClient
      slug={org.slug}
      initialTemplate={brandAssets.template ?? 'bold'}
      initialPrimaryColor={brandAssets.primary_color ?? '#FF6B00'}
      initialHeroText={brandAssets.hero_text ?? ''}
    />
  )
}
