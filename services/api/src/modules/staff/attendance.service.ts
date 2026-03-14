import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AttendanceService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async logAttendance(userId: string, locationId: string, dto: { type: string; lat?: number; lng?: number; source?: string }) {
    const { data, error } = await this.supabase
      .from('attendance_logs')
      .insert({
        user_id: userId,
        location_id: locationId,
        type: dto.type,
        lat: dto.lat,
        lng: dto.lng,
        source: dto.source || 'manual',
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getLogs(locationId: string, startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('attendance_logs')
      .select('*, users(id, full_name)')
      .eq('location_id', locationId)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate)
      .order('logged_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getPayrollSummary(locationId: string, periodStart: string, periodEnd: string) {
    const { data: logs } = await this.supabase
      .from('attendance_logs')
      .select('user_id, type, logged_at, users(full_name)')
      .eq('location_id', locationId)
      .gte('logged_at', periodStart)
      .lte('logged_at', periodEnd)
      .order('user_id')
      .order('logged_at');

    if (!logs) return [];

    // Group by user and calculate hours
    const byUser = new Map<string, { name: string; logs: any[] }>();
    for (const log of logs) {
      if (!byUser.has(log.user_id)) {
        byUser.set(log.user_id, { name: (log.users as any)?.full_name, logs: [] });
      }
      byUser.get(log.user_id)!.logs.push(log);
    }

    const summary = [];
    for (const [userId, { name, logs: userLogs }] of byUser) {
      let totalMinutes = 0;
      let clockIn: Date | null = null;

      for (const log of userLogs) {
        if (log.type === 'clock_in') {
          clockIn = new Date(log.logged_at);
        } else if (log.type === 'clock_out' && clockIn) {
          totalMinutes += (new Date(log.logged_at).getTime() - clockIn.getTime()) / 60000;
          clockIn = null;
        }
      }

      const totalHours = totalMinutes / 60;
      const regularHours = Math.min(totalHours, 40);
      const overtimeHours = Math.max(0, totalHours - 40);

      summary.push({ userId, name, totalHours, regularHours, overtimeHours });
    }

    return summary;
  }
}
