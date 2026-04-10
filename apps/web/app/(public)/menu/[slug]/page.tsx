import { createAdminClient } from '@/lib/supabase/server'
import { BoldTemplate } from '@/components/menu-templates/BoldTemplate'
import { MinimalTemplate } from '@/components/menu-templates/MinimalTemplate'
import { WarmTemplate } from '@/components/menu-templates/WarmTemplate'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = params
  const supabase = createAdminClient()

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, brand_assets')
    .eq('slug', slug)
    .maybeSingle()

  if (orgError || !org) {
    notFound()
  }

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name, description, price, category, image_url')
    .eq('organization_id', org.id)
    .order('category')

  const items = (menuItems ?? []).map(item => ({
    ...item,
    price: Number(item.price),
  }))

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)))

  const template = (org.brand_assets as any)?.template ?? 'bold'

  const restaurant = {
    name: org.name,
    slug: org.slug,
    brand_assets: org.brand_assets ?? {},
  }

  if (template === 'minimal') {
    return <MinimalTemplate restaurant={restaurant} menuItems={items} categories={categories} />
  }

  if (template === 'warm') {
    return <WarmTemplate restaurant={restaurant} menuItems={items} categories={categories} />
  }

  return <BoldTemplate restaurant={restaurant} menuItems={items} categories={categories} />
}
