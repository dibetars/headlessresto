import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PayrollService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getSummary(locationId: string, periodStart: string, periodEnd: string) {
    const { data: logs } = await this.supabase
      .from('attendance_logs')
      .select('user_id, type, logged_at, users(full_name)')
      .eq('location_id', locationId)
      .gte('logged_at', `${periodStart}T00:00:00Z`)
      .lte('logged_at', `${periodEnd}T23:59:59Z`)
      .order('user_id')
      .order('logged_at');

    if (!logs) return [];

    const byUser = new Map<string, { name: string; logs: any[] }>();
    for (const log of logs) {
      if (!byUser.has(log.user_id)) {
        byUser.set(log.user_id, { name: (log.users as any)?.full_name || log.user_id, logs: [] });
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

      const totalHours = +(totalMinutes / 60).toFixed(2);
      const regularHours = +Math.min(totalHours, 40).toFixed(2);
      const overtimeHours = +Math.max(0, totalHours - 40).toFixed(2);

      summary.push({
        userId,
        name,
        totalHours,
        regularHours,
        overtimeHours,
        periodStart,
        periodEnd,
      });
    }

    return summary;
  }
}
