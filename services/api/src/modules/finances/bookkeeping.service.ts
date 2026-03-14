import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class BookkeepingService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getSummary(locationId: string, startDate: string, endDate: string) {
    const { data: orders } = await this.supabase
      .from('orders')
      .select('total_cents, subtotal_cents, tax_cents, tip_cents, discount_cents, status, created_at')
      .eq('location_id', locationId)
      .in('status', ['completed', 'delivered'])
      .gte('created_at', `${startDate}T00:00:00Z`)
      .lte('created_at', `${endDate}T23:59:59Z`);

    if (!orders) return { revenue: 0, orders: 0, avgOrderValue: 0 };

    const revenue = orders.reduce((sum, o) => sum + o.total_cents, 0);
    const tax = orders.reduce((sum, o) => sum + o.tax_cents, 0);
    const tips = orders.reduce((sum, o) => sum + (o.tip_cents || 0), 0);
    const discounts = orders.reduce((sum, o) => sum + (o.discount_cents || 0), 0);

    return {
      orderCount: orders.length,
      revenueCents: revenue,
      taxCents: tax,
      tipsCents: tips,
      discountsCents: discounts,
      netRevenueCents: revenue - tax,
      avgOrderValueCents: orders.length > 0 ? Math.floor(revenue / orders.length) : 0,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  async getDailyBreakdown(locationId: string, startDate: string, endDate: string) {
    const { data: orders } = await this.supabase
      .from('orders')
      .select('total_cents, created_at')
      .eq('location_id', locationId)
      .in('status', ['completed', 'delivered'])
      .gte('created_at', `${startDate}T00:00:00Z`)
      .lte('created_at', `${endDate}T23:59:59Z`);

    if (!orders) return [];

    const byDay = new Map<string, { date: string; revenueCents: number; orderCount: number }>();
    for (const order of orders) {
      const date = order.created_at.split('T')[0];
      if (!byDay.has(date)) byDay.set(date, { date, revenueCents: 0, orderCount: 0 });
      const day = byDay.get(date)!;
      day.revenueCents += order.total_cents;
      day.orderCount += 1;
    }

    return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
