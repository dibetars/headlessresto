'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTables() {
  const supabase = createClient();
  const { data, error } = await supabase.from('tables').select('*').order('table_number', { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function addTable(prevState: any, formData: FormData) {
  const supabase = createClient();
  const data = {
    table_number: formData.get('table_number') as string,
    capacity: Number(formData.get('capacity')),
    status: 'available',
  };
  const { error } = await supabase.from('tables').insert(data);
  if (error) {
    console.error(error);
    return { message: 'Failed to add table' };
  }
  revalidatePath('/dashboard/tables');
  return { message: 'Table added successfully' };
}

export async function deleteTable(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) {
    console.error(error);
  }
  revalidatePath('/dashboard/tables');
}
