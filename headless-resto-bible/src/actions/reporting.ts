'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSalesData() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total')
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }

  // Group by date
  const salesByDate: Record<string, number> = {};
  data.forEach(order => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    salesByDate[date] = (salesByDate[date] || 0) + (order.total || 0);
  });

  return Object.entries(salesByDate).map(([date, sales]) => ({ date, sales }));
}

export async function getPopularItems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('order_items')
    .select('quantity, menu_item:menu_items(name)');

  if (error) {
    console.error('Error fetching popular items:', error);
    return [];
  }

  // Aggregate by item name
  const itemCounts: Record<string, number> = {};
  data.forEach(item => {
    const name = (item.menu_item as any)?.name || 'Unknown';
    itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 0);
  });

  return Object.entries(itemCounts)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
}
