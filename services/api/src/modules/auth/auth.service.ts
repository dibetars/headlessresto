import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getUser(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data.user) throw new UnauthorizedException('Invalid token');
    return data.user;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new UnauthorizedException('User profile not found');
    return data;
  }

  async getUserMemberships(userId: string) {
    const { data, error } = await this.supabase
      .from('org_memberships')
      .select('*, organizations(id, name, slug), locations(id, name)')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw new Error(error.message);
    return data;
  }
}
