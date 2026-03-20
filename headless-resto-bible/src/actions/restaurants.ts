'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addRestaurant(formData: FormData) {
  const supabase = createClient();
  
  const data = {
    name: formData.get('name') as string,
    owner: formData.get('owner') as string,
    location: formData.get('location') as string,
    status: 'pending',
    revenue: '$0',
    joined_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  const { error } = await supabase.from('restaurants').insert([data]);

  if (error) {
    console.error('Error adding restaurant:', error);
    throw new Error('Could not add restaurant.');
  }

  revalidatePath('/dashboard/restaurants');
  revalidatePath('/dashboard');
}

export async function updateRestaurantStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from('restaurants').update({ status }).eq('id', id);
  
  if (error) {
    console.error('Error updating restaurant status:', error);
    throw new Error('Could not update status.');
  }

  revalidatePath('/dashboard/restaurants');
}
