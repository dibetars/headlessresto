import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StaffService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getStaff(locationId: string) {
    const { data, error } = await this.supabase
      .from('org_memberships')
      .select('*, users(id, email, full_name, phone, avatar_url)')
      .eq('location_id', locationId)
      .eq('is_active', true);

    if (error) throw new Error(error.message);
    return data;
  }
}
