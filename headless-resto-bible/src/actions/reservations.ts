'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addReservation(prevState: any, formData: FormData) {
  const supabase = createClient();
  
  const data = {
    customer_name: formData.get('customer_name') as string,
    customer_email: formData.get('customer_email') as string,
    customer_phone: formData.get('customer_phone') as string,
    number_of_guests: parseInt(formData.get('number_of_guests') as string),
    reservation_date: formData.get('reservation_date') as string,
    reservation_time: formData.get('reservation_time') as string,
    status: 'pending'
  };

  const { error } = await supabase.from('reservations').insert([data]);

  if (error) {
    console.error('Error adding reservation:', error);
    return { message: 'Error adding reservation' };
  }

  revalidatePath('/reservations');
  return { message: 'Success! Your reservation has been submitted.' };
}

export async function updateReservationStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating reservation status:', error);
    throw new Error('Could not update reservation status');
  }

  revalidatePath('/reservations');
}

export async function deleteReservation(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting reservation:', error);
    throw new Error('Could not delete reservation');
  }

  revalidatePath('/reservations');
}
