
'use server';

import { createClient } from '@/lib/supabase/server';

export async function addToWaitlist(prevState: any, formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;

  if (!email) {
    return { message: 'Email is required.' };
  }

  const { error } = await supabase.from('waitlist').insert([{ email }]);

  if (error) {
    return { message: 'Failed to add to waitlist. Please try again.' };
  }

  return { message: 'Thanks for joining the waitlist!' };
}

export async function getWaitlist() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching waitlist:', error);
    return [];
  }
  return data;
}
