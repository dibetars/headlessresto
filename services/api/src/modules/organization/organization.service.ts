import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateOrgDto } from './dto/create-org.dto';

@Injectable()
export class OrganizationService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async create(userId: string, dto: CreateOrgDto) {
    // Check slug uniqueness
    const { data: existing } = await this.supabase
      .from('organizations')
      .select('id')
      .eq('slug', dto.slug)
      .maybeSingle();

    if (existing) throw new ConflictException('Slug already taken');

    const { data: org, error: orgError } = await this.supabase
      .from('organizations')
      .insert({ ...dto, owner_user_id: userId })
      .select()
      .single();

    if (orgError) throw new Error(orgError.message);

    // Grant owner membership
    await this.supabase.from('org_memberships').insert({
      user_id: userId,
      org_id: org.id,
      location_id: null,
      role: 'owner',
    });

    // Create a starter license (expires in 1 year)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await this.supabase.from('licenses').insert({
      org_id: org.id,
      tier: 'starter',
      max_locations: 1,
      hosting_expires_at: expiresAt.toISOString(),
    });

    return org;
  }

  async findById(orgId: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*, licenses(*), locations(id, name, is_active)')
      .eq('id', orgId)
      .single();

    if (error || !data) throw new NotFoundException('Organization not found');
    return data;
  }

  async update(orgId: string, updates: Partial<CreateOrgDto>) {
    const { data, error } = await this.supabase
      .from('organizations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getMembers(orgId: string) {
    const { data, error } = await this.supabase
      .from('org_memberships')
      .select('*, users(id, email, full_name, avatar_url), locations(id, name)')
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (error) throw new Error(error.message);
    return data;
  }

  async inviteMember(orgId: string, dto: { email: string; role: string; location_id?: string }) {
    // Look up user by email
    const { data: user } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .maybeSingle();

    if (!user) throw new NotFoundException('User not found. They must register first.');

    const { data, error } = await this.supabase
      .from('org_memberships')
      .upsert({
        user_id: user.id,
        org_id: orgId,
        location_id: dto.location_id || null,
        role: dto.role,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async removeMember(membershipId: string) {
    const { error } = await this.supabase
      .from('org_memberships')
      .update({ is_active: false })
      .eq('id', membershipId);

    if (error) throw new Error(error.message);
  }
}
