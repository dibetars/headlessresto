import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UberDirectService } from './uber-direct.service';

@Injectable()
export class DeliveriesService {
  private supabase: SupabaseClient;

  constructor(private uberDirect: UberDirectService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async dispatch(orderId: string, dropoffAddress: string) {
    const { data: order } = await this.supabase
      .from('orders')
      .select('*, locations(address, city, state, zip, uber_fleet_api_key_enc, name)')
      .eq('id', orderId)
      .single();

    if (!order) throw new NotFoundException('Order not found');

    const location = order.locations as any;
    if (!location.uber_fleet_api_key_enc) {
      throw new BadRequestException('Location has no Uber Direct API key configured');
    }

    const pickupAddress = [location.address, location.city, location.state, location.zip]
      .filter(Boolean)
      .join(', ');

    const uberDelivery = await this.uberDirect.createDelivery({
      pickup: {
        name: location.name,
        address: pickupAddress,
        phone: process.env.DEFAULT_PICKUP_PHONE || '',
      },
      dropoff: {
        name: order.customer_name || 'Customer',
        address: dropoffAddress,
        phone: order.customer_phone || '',
      },
      items: (order.items as any[]).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price_cents / 100,
      })),
      apiKey: location.uber_fleet_api_key_enc,
    }) as any;

    const { data, error } = await this.supabase
      .from('deliveries')
      .insert({
        order_id: orderId,
        uber_delivery_id: uberDelivery.id,
        status: 'pending',
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        tracking_url: uberDelivery.tracking_url,
        estimated_delivery_at: uberDelivery.dropoff?.eta,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update order status
    await this.supabase
      .from('orders')
      .update({ status: 'out_for_delivery', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return data;
  }

  async getDelivery(deliveryId: string) {
    const { data, error } = await this.supabase
      .from('deliveries')
      .select('*, orders(id, customer_name, total_cents, items)')
      .eq('id', deliveryId)
      .single();

    if (error || !data) throw new NotFoundException('Delivery not found');
    return data;
  }

  async getActiveDeliveries(locationId: string) {
    const { data, error } = await this.supabase
      .from('deliveries')
      .select('*, orders!inner(location_id, customer_name, customer_phone, total_cents)')
      .eq('orders.location_id', locationId)
      .not('status', 'in', '(delivered,cancelled,failed)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async syncStatus(deliveryId: string) {
    const { data: delivery } = await this.supabase
      .from('deliveries')
      .select('*, orders!inner(locations(uber_fleet_api_key_enc))')
      .eq('id', deliveryId)
      .single();

    if (!delivery?.uber_delivery_id) return delivery;

    const apiKey = (delivery as any).orders?.locations?.uber_fleet_api_key_enc;
    if (!apiKey) return delivery;

    const uberStatus = await this.uberDirect.getDeliveryStatus(delivery.uber_delivery_id, apiKey) as any;

    const statusMap: Record<string, string> = {
      pending: 'pending',
      pickup: 'driver_assigned',
      pickup_complete: 'picked_up',
      dropoff: 'in_transit',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };

    const newStatus = statusMap[uberStatus.status] || delivery.status;

    const { data, error } = await this.supabase
      .from('deliveries')
      .update({
        status: newStatus,
        driver_name: uberStatus.courier?.name,
        driver_phone: uberStatus.courier?.phone_number,
        actual_delivery_at: newStatus === 'delivered' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
