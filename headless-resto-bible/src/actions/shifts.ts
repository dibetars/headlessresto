'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getShifts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shifts')
    .select('*, staff:staff(name, role)')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching shifts:', error);
    return [];
  }
  return data;
}

export async function addShift(formData: {
  staff_id: string;
  start_time: string;
  end_time: string;
  role: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from('shifts').insert(formData);

  if (error) {
    console.error('Error adding shift:', error);
    throw new Error('Could not add shift.');
  }
  revalidatePath('/dashboard/staff/scheduling');
}

export async function deleteShift(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('shifts').delete().eq('id', id);

  if (error) {
    console.error('Error deleting shift:', error);
    throw new Error('Could not delete shift.');
  }
  revalidatePath('/dashboard/staff/scheduling');
}
