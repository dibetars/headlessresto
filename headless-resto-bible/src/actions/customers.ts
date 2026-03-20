'use server';

import { createClient } from '@/lib/supabase/server';
import { Customer } from '@/lib/types';

export async function getCustomers(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*, orders(*)');
    
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data;
}
