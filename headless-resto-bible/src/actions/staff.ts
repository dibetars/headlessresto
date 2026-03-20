'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStaff() {
  const supabase = createClient();
  const { data, error } = await supabase.from('staff').select('*');
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function addStaff(prevState: any, formData: FormData) {
  const supabase = createClient();
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    role: formData.get('role') as string,
  };
  const { error } = await supabase.from('staff').insert(data);
  if (error) {
    console.error(error);
    return { message: 'Failed to add staff member' };
  }
  revalidatePath('/staff');
  return { message: 'Staff member added successfully' };
}

export async function updateStaff(id: string, formData: FormData) {
  const supabase = createClient();
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    role: formData.get('role') as string,
  };
  const { error } = await supabase.from('staff').update(data).eq('id', id);
  if (error) {
    console.error(error);
  }
  revalidatePath('/staff');
}

export async function deleteStaff(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) {
    console.error(error);
  }
  revalidatePath('/staff');
}

export async function approveStaff(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('staff').update({ is_approved: true }).eq('id', id);
  if (error) {
    console.error('Error approving staff:', error);
    throw new Error('Could not approve staff.');
  }
  revalidatePath('/staff');
}

export async function updateProfile(id: string, name: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('staff').update({ name }).eq('id', id);
  if (error) {
    console.error('Error updating profile:', error);
    throw new Error('Could not update profile.');
  }
  revalidatePath('/dashboard/profile');
}
