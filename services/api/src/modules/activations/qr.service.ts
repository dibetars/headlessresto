import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class QrService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Returns the public menu data for a QR code scan.
   * No auth required — uses the location slug.
   */
  async getPublicMenu(locationSlug: string) {
    const { data: location } = await this.supabase
      .from('locations')
      .select('id, name, operating_hours, organizations(name, brand_assets)')
      .eq('slug', locationSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (!location) return null;

    // Get today's published daily menu
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyMenu } = await this.supabase
      .from('daily_menus')
      .select('*, menu_items(*)')
      .eq('location_id', location.id)
      .eq('menu_date', today)
      .eq('is_published', true)
      .maybeSingle();

    // Fall back to all available items if no daily menu
    let items = [];
    if (dailyMenu) {
      items = (dailyMenu as any).menu_items || [];
    } else {
      const { data: allItems } = await this.supabase
        .from('menu_items')
        .select('*')
        .eq('location_id', location.id)
        .eq('is_available', true)
        .order('category')
        .order('sort_order');
      items = allItems || [];
    }

    // Group by category
    const byCategory = items.reduce((acc: Record<string, any[]>, item: any) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return {
      location: {
        id: location.id,
        name: location.name,
        organization: (location as any).organizations,
        operating_hours: location.operating_hours,
      },
      menu: byCategory,
      specials: dailyMenu ? (dailyMenu as any).specials : [],
    };
  }

  async generateQrCodes(locationId: string, tableCount: number) {
    const { data: location } = await this.supabase
      .from('locations')
      .select('organizations(slug), name')
      .eq('id', locationId)
      .single();

    if (!location) return [];

    const orgSlug = (location as any).organizations?.slug;
    const webUrl = process.env.WEB_URL || 'http://localhost:3000';

    const tables = Array.from({ length: tableCount }, (_, i) => ({
      table: i + 1,
      url: `${webUrl}/menu/${orgSlug}?table=${i + 1}`,
      label: `Table ${i + 1}`,
    }));

    return tables;
  }
}
