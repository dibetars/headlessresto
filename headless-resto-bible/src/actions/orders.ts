'use server';

import { createClient } from '@/lib/supabase/server';
import { Order } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getOrders(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, menu_item:menu_items(name)), table:tables(table_number)')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('orders').update({ status }).match({ id });
  if (error) {
    console.error('Error updating order status:', error);
    throw new Error('Could not update order status.');
  }
  revalidatePath('/dashboard/orders');
}

export async function createOrder(orderData: {
  table_id: string;
  customer_id?: string;
  items: { menu_item_id: string; quantity: number; price: number }[];
  total: number;
}): Promise<any> {
  const supabase = createClient();

  // 1. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_id: orderData.table_id,
      customer_id: orderData.customer_id,
      total: orderData.total,
      status: 'pending'
    })
    .select('*, items:order_items(*, menu_item:menu_items(name))')
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw new Error('Could not create order.');
  }

  // 2. Insert order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      orderData.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price
      }))
    );

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw new Error('Could not create order items.');
  }

  // 3. Update table status to occupied
  const { error: tableUpdateError } = await supabase
    .from('tables')
    .update({ status: 'occupied' })
    .eq('id', orderData.table_id);

  if (tableUpdateError) {
    console.error('Error updating table status:', tableUpdateError);
    // Don't throw here as the order itself was successful
  }

  revalidatePath('/dashboard/orders');
  revalidatePath('/dashboard/tables');
  return order;
}
