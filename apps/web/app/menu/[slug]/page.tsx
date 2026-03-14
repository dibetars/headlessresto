import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { QRMenuClient } from './client';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: org } = await supabase.from('organizations').select('name').eq('slug', params.slug).single();
  return { title: org ? `${org.name} — Menu` : 'Menu' };
}

export default async function MenuPage({
  params, searchParams,
}: {
  params: { slug: string };
  searchParams: { table?: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data: org } = await supabase.from('organizations')
    .select('id, name, brand_assets').eq('slug', params.slug).single();
  if (!org) notFound();

  // Get first active location (future: support multi-location slug)
  const { data: location } = await supabase.from('locations')
    .select('id, name, operating_hours').eq('org_id', org.id).eq('is_active', true).limit(1).single();
  if (!location) notFound();

  const today = new Date().toISOString().split('T')[0];

  // Get today's daily menu if published, otherwise all available items
  const { data: dailyMenu } = await supabase.from('daily_menus')
    .select('item_ids, specials').eq('location_id', location.id)
    .eq('menu_date', today).eq('is_published', true).maybeSingle();

  let items: any[] = [];
  if (dailyMenu?.item_ids?.length) {
    const { data } = await supabase.from('menu_items').select('*')
      .in('id', dailyMenu.item_ids).eq('is_available', true).order('sort_order');
    items = data || [];
  } else {
    const { data } = await supabase.from('menu_items').select('*')
      .eq('location_id', location.id).eq('is_available', true).order('category').order('sort_order');
    items = data || [];
  }

  return (
    <QRMenuClient
      org={org}
      location={location}
      items={items}
      specials={dailyMenu?.specials || []}
      tableNumber={searchParams.table}
    />
  );
}
