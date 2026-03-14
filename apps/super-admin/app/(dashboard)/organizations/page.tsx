import { supabaseAdmin } from '../../../lib/supabase';
import Link from 'next/link';
import { Building2, MapPin, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getOrganizations() {
  const { data: orgs } = await supabaseAdmin
    .from('organizations')
    .select('id, name, slug, created_at')
    .order('created_at', { ascending: false });

  if (!orgs) return [];

  // Enrich with location + member counts
  const enriched = await Promise.all(
    orgs.map(async (org) => {
      const [{ count: locations }, { count: members }, { data: license }] = await Promise.all([
        supabaseAdmin.from('locations').select('*', { count: 'exact', head: true }).eq('org_id', org.id),
        supabaseAdmin.from('org_memberships').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('is_active', true),
        supabaseAdmin.from('licenses').select('tier, hosting_expires_at, max_locations, max_staff').eq('org_id', org.id).single(),
      ]);
      return { ...org, locations: locations ?? 0, members: members ?? 0, license: license ?? null };
    }),
  );

  return enriched;
}

const TIER_COLOR: Record<string, string> = {
  starter: 'bg-gray-700 text-gray-300',
  professional: 'bg-blue-900 text-blue-300',
  enterprise: 'bg-purple-900 text-purple-300',
};

export default async function OrganizationsPage() {
  const orgs = await getOrganizations();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-gray-400 text-sm mt-0.5">{orgs.length} total restaurants</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Organization</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Tier</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Locations</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Members</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">License Expires</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {orgs.map((org) => {
              const expiry = org.license?.hosting_expires_at ? new Date(org.license.hosting_expires_at) : null;
              const isExpired = expiry && expiry < new Date();
              const isExpiringSoon = expiry && !isExpired && (expiry.getTime() - Date.now()) < 14 * 86400 * 1000;

              return (
                <tr key={org.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{org.name}</p>
                        <p className="text-xs text-gray-500">/{org.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {org.license ? (
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_COLOR[org.license.tier] ?? TIER_COLOR.starter}`}>
                        {org.license.tier}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      {org.locations}
                      {org.license && <span className="text-gray-600">/ {org.license.max_locations}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      {org.members}
                      {org.license?.max_staff && <span className="text-gray-600">/ {org.license.max_staff}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {expiry ? (
                      <span className={`text-sm font-medium ${isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-gray-300'}`}>
                        {isExpired ? 'Expired ' : isExpiringSoon ? 'Expiring ' : ''}
                        {expiry.toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orgs.length === 0 && (
          <div className="text-center py-16 text-gray-500">No organizations yet.</div>
        )}
      </div>
    </div>
  );
}
