import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ScheduleService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getSchedule(locationId: string, startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('staff_schedules')
      .select('*, users(id, full_name, avatar_url)')
      .eq('location_id', locationId)
      .gte('shift_date', startDate)
      .lte('shift_date', endDate)
      .order('shift_date')
      .order('start_time');

    if (error) throw new Error(error.message);
    return data;
  }

  async createShift(locationId: string, dto: any) {
    const { data, error } = await this.supabase
      .from('staff_schedules')
      .insert({ ...dto, location_id: locationId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteShift(shiftId: string) {
    const { error } = await this.supabase
      .from('staff_schedules')
      .delete()
      .eq('id', shiftId);

    if (error) throw new Error(error.message);
  }
}
