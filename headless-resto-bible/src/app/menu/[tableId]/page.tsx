import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PublicMenu from './components/PublicMenu';

export default async function PublicMenuPage({
  params,
}: {
  params: { tableId: string };
}) {
  const supabase = createClient();

  // Verify table exists
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('*')
    .eq('id', params.tableId)
    .single();

  if (tableError || !table) {
    notFound();
  }

  // Fetch menu items
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('*');

  if (menuError) {
    console.error('Error fetching menu items:', menuError);
    return <div>Error loading menu.</div>;
  }

  // Transform data to match local types (imageUrl vs image_url)
  const transformedItems = menuItems.map(item => ({
    ...item,
    imageUrl: item.image_url // Map DB snake_case to frontend camelCase
  }));

  return (
    <PublicMenu 
      menuItems={transformedItems} 
      tableNumber={table.table_number}
      tableId={params.tableId}
    />
  );
}
