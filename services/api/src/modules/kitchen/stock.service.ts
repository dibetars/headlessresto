import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StockService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getItems(locationId: string) {
    const { data, error } = await this.supabase
      .from('stock_items')
      .select('*')
      .eq('location_id', locationId)
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  async getLowStockItems(locationId: string) {
    const { data, error } = await this.supabase
      .from('stock_items')
      .select('*')
      .eq('location_id', locationId)
      .not('reorder_threshold', 'is', null)
      .lte('quantity', this.supabase.from('stock_items').select('reorder_threshold') as any);

    // Simpler approach: fetch all and filter in-memory
    const { data: all, error: allError } = await this.supabase
      .from('stock_items')
      .select('*')
      .eq('location_id', locationId)
      .not('reorder_threshold', 'is', null);

    if (allError) throw new Error(allError.message);
    return (all || []).filter((item) => item.quantity <= item.reorder_threshold);
  }

  async createItem(locationId: string, dto: any) {
    const { data, error } = await this.supabase
      .from('stock_items')
      .insert({ ...dto, location_id: locationId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateItem(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('stock_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async recordMovement(stockItemId: string, dto: { quantity_change: number; reason: string; recorded_by: string }) {
    // Insert into the append-only movements ledger
    // The DB trigger (trg_stock_movement_update) automatically updates stock_items.quantity
    const { data, error } = await this.supabase
      .from('stock_movements')
      .insert({
        stock_item_id: stockItemId,
        quantity_change: dto.quantity_change,
        reason: dto.reason,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getMovements(stockItemId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('stock_movements')
      .select('*')
      .eq('stock_item_id', stockItemId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data;
  }
}
