'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Revenue Today
  const { data: ordersToday, error: ordersError } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'completed')
    .gte('created_at', today.toISOString());

  const revenueToday = ordersToday?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  // 2. Active Orders (Pending or In-Progress)
  const { count: activeOrders, error: activeOrdersError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'in-progress']);

  // 3. Pending Staff Approvals
  const { count: pendingStaff, error: pendingStaffError } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false);

  // 4. Occupied Tables
  const { count: occupiedTables, error: tablesError } = await supabase
    .from('tables')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'occupied');

  return {
    revenueToday,
    activeOrders: activeOrders || 0,
    pendingStaff: pendingStaff || 0,
    occupiedTables: occupiedTables || 0,
  };
}
