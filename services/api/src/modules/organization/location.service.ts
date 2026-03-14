import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async create(orgId: string, dto: CreateLocationDto) {
    const { data, error } = await this.supabase
      .from('locations')
      .insert({ ...dto, org_id: orgId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findByOrg(orgId: string) {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('org_id', orgId)
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  async findById(locationId: string) {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error || !data) throw new NotFoundException('Location not found');
    return data;
  }

  async update(locationId: string, updates: Partial<CreateLocationDto>) {
    const { data, error } = await this.supabase
      .from('locations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStripeAccount(locationId: string, stripeAccountId: string) {
    return this.update(locationId, { stripe_account_id: stripeAccountId } as any);
  }
}
