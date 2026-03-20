'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitLead(prevState: any, formData: FormData) {
  const supabase = createClient();

  const type = formData.get('type') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || (!email && !phone)) {
    return { message: 'Name and at least one contact method (email or phone) are required.' };
  }

  const { error } = await supabase.from('leads').insert([{
    type,
    name,
    email,
    phone,
    subject,
    message,
    status: 'new'
  }]);

  if (error) {
    console.error('Error submitting lead:', error);
    return { message: 'Failed to submit. Please try again later.' };
  }

  revalidatePath('/dashboard/leads');
  return { message: 'Success! We will get back to you soon.' };
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  
  if (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Could not update status.');
  }

  revalidatePath('/dashboard/leads');
}

export async function getLeads() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
  return data;
}
