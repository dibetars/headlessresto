import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MenuService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getItems(locationId: string, category?: string) {
    let query = this.supabase
      .from('menu_items')
      .select('*')
      .eq('location_id', locationId)
      .order('sort_order');

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async getPublicItems(locationId: string) {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*')
      .eq('location_id', locationId)
      .eq('is_available', true)
      .order('category')
      .order('sort_order');

    if (error) throw new Error(error.message);
    return data;
  }

  async createItem(locationId: string, dto: any) {
    const { data, error } = await this.supabase
      .from('menu_items')
      .insert({ ...dto, location_id: locationId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateItem(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async toggleAvailability(id: string) {
    const { data: item } = await this.supabase
      .from('menu_items')
      .select('is_available')
      .eq('id', id)
      .single();

    if (!item) throw new NotFoundException('Menu item not found');

    return this.updateItem(id, { is_available: !item.is_available });
  }

  async deleteItem(id: string) {
    const { error } = await this.supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async getDailyMenu(locationId: string, date: string) {
    const { data, error } = await this.supabase
      .from('daily_menus')
      .select('*, menu_items(*)')
      .eq('location_id', locationId)
      .eq('menu_date', date)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async createDailyMenu(locationId: string, dto: { date: string; item_ids: string[]; specials?: any[] }) {
    const { data, error } = await this.supabase
      .from('daily_menus')
      .upsert({
        location_id: locationId,
        menu_date: dto.date,
        item_ids: dto.item_ids,
        specials: dto.specials || [],
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async publishDailyMenu(id: string) {
    const { data, error } = await this.supabase
      .from('daily_menus')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
