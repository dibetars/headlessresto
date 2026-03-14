import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type OrderStatus } from '@restaurantos/shared';

@Injectable()
export class OrdersService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async create(locationId: string, dto: any) {
    // Validate menu items exist and are available
    const itemIds = dto.items.map((i: any) => i.menu_item_id);
    const { data: menuItems } = await this.supabase
      .from('menu_items')
      .select('id, name, price_cents, is_available')
      .eq('location_id', locationId)
      .in('id', itemIds);

    if (!menuItems || menuItems.length !== itemIds.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    const unavailable = menuItems.filter((m) => !m.is_available);
    if (unavailable.length) {
      throw new BadRequestException(
        `Items unavailable: ${unavailable.map((m) => m.name).join(', ')}`,
      );
    }

    // Build order items snapshot
    const itemMap = new Map(menuItems.map((m) => [m.id, m]));
    const orderItems = dto.items.map((i: any) => ({
      menu_item_id: i.menu_item_id,
      name: itemMap.get(i.menu_item_id)!.name,
      quantity: i.quantity,
      price_cents: itemMap.get(i.menu_item_id)!.price_cents,
    }));

    const subtotal = orderItems.reduce(
      (sum: number, i: any) => sum + i.price_cents * i.quantity,
      0,
    );

    // Apply coupon
    let discountCents = 0;
    let couponId: string | null = null;
    if (dto.coupon_code) {
      const coupon = await this.validateCoupon(locationId, dto.coupon_code, subtotal);
      if (coupon) {
        couponId = coupon.id;
        discountCents =
          coupon.type === 'percentage'
            ? Math.floor(subtotal * (coupon.value / 100))
            : Math.floor(coupon.value * 100);
      }
    }

    const taxCents = Math.floor((subtotal - discountCents) * 0.0875); // 8.75% default tax
    const totalCents = subtotal + taxCents + (dto.tip_cents || 0) - discountCents;

    const { data: order, error } = await this.supabase
      .from('orders')
      .insert({
        location_id: locationId,
        source: dto.source,
        status: 'pending',
        customer_name: dto.customer_name,
        customer_phone: dto.customer_phone,
        customer_email: dto.customer_email,
        items: orderItems,
        subtotal_cents: subtotal,
        tax_cents: taxCents,
        tip_cents: dto.tip_cents || 0,
        discount_cents: discountCents,
        total_cents: totalCents,
        coupon_id: couponId,
        notes: dto.notes,
        table_number: dto.table_number,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Increment coupon usage
    if (couponId) {
      await this.supabase.rpc('increment_coupon_usage', { coupon_id: couponId });
    }

    return order;
  }

  async findById(orderId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, payments(*), deliveries(*)')
      .eq('id', orderId)
      .single();

    if (error || !data) throw new NotFoundException('Order not found');
    return data;
  }

  async findByLocation(locationId: string, filters: { status?: OrderStatus; limit?: number } = {}) {
    let query = this.supabase
      .from('orders')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50);

    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  private async validateCoupon(locationId: string, code: string, subtotalCents: number) {
    const now = new Date().toISOString();
    const { data } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('location_id', locationId)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .maybeSingle();

    if (!data) return null;
    if (data.max_uses && data.current_uses >= data.max_uses) return null;
    if (subtotalCents < data.min_order_cents) return null;
    return data;
  }
}
