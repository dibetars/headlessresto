import { supabaseAdmin } from '../../../lib/supabase';
import RenewForm from './renew-form';

export const dynamic = 'force-dynamic';

async function getUpcomingRenewals() {
  const thirtyDaysOut = new Date(Date.now() + 30 * 86400 * 1000).toISOString();

  const { data } = await supabaseAdmin
    .from('licenses')
    .select('*, organizations(name, slug)')
    .lte('hosting_expires_at', thirtyDaysOut)
    .order('hosting_expires_at', { ascending: true });

  return data ?? [];
}

const TIER_FEE: Record<string, number> = {
  starter: 4900,
  professional: 14900,
  enterprise: 49900,
};

export default async function BillingPage() {
  const upcoming = await getUpcomingRenewals();
  const now = new Date();

  const expired = upcoming.filter((l) => l.hosting_expires_at && new Date(l.hosting_expires_at) < now);
  const expiring = upcoming.filter((l) => l.hosting_expires_at && new Date(l.hosting_expires_at) >= now);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Billing & Renewals</h1>
        <p className="text-gray-400 text-sm mt-0.5">Licenses expiring within 30 days</p>
      </div>

      {/* Expired section */}
      {expired.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Expired</h2>
          <div className="space-y-3">
            {expired.map((license) => {
              const org = license.organizations as { name: string; slug: string } | null;
              return (
                <div key={license.id} className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{org?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Expired {new Date(license.hosting_expires_at).toLocaleDateString()} · {license.tier} plan
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-gray-300">
                      ${((TIER_FEE[license.tier] ?? 4900) / 100).toFixed(2)}/mo
                    </p>
                    <RenewForm licenseId={license.id} currentExpiry={license.hosting_expires_at} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expiring soon section */}
      {expiring.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Expiring Soon</h2>
          <div className="space-y-3">
            {expiring.map((license) => {
              const org = license.organizations as { name: string; slug: string } | null;
              const daysLeft = Math.ceil((new Date(license.hosting_expires_at).getTime() - now.getTime()) / 86400000);
              return (
                <div key={license.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{org?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {daysLeft}d left · expires {new Date(license.hosting_expires_at).toLocaleDateString()} · {license.tier} plan
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-gray-300">
                      ${((TIER_FEE[license.tier] ?? 4900) / 100).toFixed(2)}/mo
                    </p>
                    <RenewForm licenseId={license.id} currentExpiry={license.hosting_expires_at} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No renewals due in the next 30 days.
        </div>
      )}
    </div>
  );
}
