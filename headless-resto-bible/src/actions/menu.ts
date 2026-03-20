'use server';

import { createClient } from '@/lib/supabase/server';
import { MenuItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('menu_items').select('*');
  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
  return data.map(item => ({
    ...item,
    imageUrl: item.image_url
  }));
}

export async function addMenuItem(prevState: any, formData: FormData): Promise<{ message: string; }> {
  const supabase = createClient();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const category = formData.get('category') as string;
  const imageUrl = formData.get('image_url') as string;

  if (!name || !description || isNaN(price) || !category) {
    return { message: 'Required fields are missing or invalid.' };
  }

  const { error } = await supabase.from('menu_items').insert([{ 
    name, 
    description, 
    price, 
    category,
    image_url: imageUrl || null 
  }]);

  if (error) {
    console.error('Error adding menu item:', error);
    return { message: 'Could not add menu item.' };
  }

  revalidatePath('/dashboard/menu');
  return { message: 'Success: Item added' };
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('menu_items').update(item).match({ id });
  if (error) {
    console.error('Error updating menu item:', error);
    throw new Error('Could not update menu item.');
  }
  revalidatePath('/dashboard/menu');
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('menu_items').delete().match({ id });
  if (error) {
    console.error('Error deleting menu item:', error);
    throw new Error('Could not delete menu item.');
  }
  revalidatePath('/dashboard/menu');
}
