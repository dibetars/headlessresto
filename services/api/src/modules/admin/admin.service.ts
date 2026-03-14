import { Injectable, ForbiddenException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  private assertSuperAdmin(email: string) {
    const adminEmails = (process.env.SUPER_ADMIN_EMAILS || '').split(',').map((e) => e.trim());
    if (!adminEmails.includes(email)) {
      throw new ForbiddenException('Super admin access required');
    }
  }

  async listOrganizations(email: string, page = 1, limit = 50) {
    this.assertSuperAdmin(email);
    const from = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .from('organizations')
      .select('*, licenses(*), locations(count)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw new Error(error.message);
    return { data, total: count, page, limit };
  }

  async getOrgDetails(email: string, orgId: string) {
    this.assertSuperAdmin(email);

    const { data, error } = await this.supabase
      .from('organizations')
      .select('*, licenses(*), locations(*, org_memberships(count))')
      .eq('id', orgId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateLicense(email: string, orgId: string, updates: { tier?: string; hosting_expires_at?: string; max_locations?: number }) {
    this.assertSuperAdmin(email);

    const { data, error } = await this.supabase
      .from('licenses')
      .update(updates)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getSystemHealth(email: string) {
    this.assertSuperAdmin(email);

    const [orgs, locations, orders] = await Promise.all([
      this.supabase.from('organizations').select('id', { count: 'exact', head: true }),
      this.supabase.from('locations').select('id', { count: 'exact', head: true }),
      this.supabase.from('orders').select('id', { count: 'exact', head: true }),
    ]);

    return {
      organizations: orgs.count,
      locations: locations.count,
      totalOrders: orders.count,
      timestamp: new Date().toISOString(),
    };
  }
}
