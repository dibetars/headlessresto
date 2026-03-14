import { supabaseAdmin } from '../../../lib/supabase';
import UpdateLicenseForm from './update-license-form';

export const dynamic = 'force-dynamic';

async function getLicenses() {
  const { data } = await supabaseAdmin
    .from('licenses')
    .select('*, organizations(name, slug)')
    .order('hosting_expires_at', { ascending: true });
  return data ?? [];
}

const TIER_COLOR: Record<string, string> = {
  starter: 'bg-gray-700 text-gray-300',
  professional: 'bg-blue-900 text-blue-300',
  enterprise: 'bg-purple-900 text-purple-300',
};

export default async function LicensesPage() {
  const licenses = await getLicenses();

  const now = new Date();
  const expiredCount = licenses.filter((l) => l.hosting_expires_at && new Date(l.hosting_expires_at) < now).length;
  const expiringSoon = licenses.filter((l) => {
    if (!l.hosting_expires_at) return false;
    const exp = new Date(l.hosting_expires_at);
    return exp >= now && (exp.getTime() - now.getTime()) < 14 * 86400 * 1000;
  }).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Licenses</h1>
        <p className="text-gray-400 text-sm mt-0.5">{licenses.length} total · {expiredCount} expired · {expiringSoon} expiring soon</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: licenses.length, color: 'text-white' },
          { label: 'Expired', value: expiredCount, color: 'text-red-400' },
          { label: 'Expiring ≤14d', value: expiringSoon, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Organization</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Tier</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Limits</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Modules</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Expires</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {licenses.map((license) => {
              const exp = license.hosting_expires_at ? new Date(license.hosting_expires_at) : null;
              const isExpired = exp && exp < now;
              const isSoon = exp && !isExpired && (exp.getTime() - now.getTime()) < 14 * 86400 * 1000;
              const org = license.organizations as { name: string; slug: string } | null;

              return (
                <tr key={license.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white text-sm">{org?.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">/{org?.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_COLOR[license.tier] ?? TIER_COLOR.starter}`}>
                      {license.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {license.max_locations} loc · {license.max_staff} staff
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(license.modules_enabled as string[] ?? []).map((m: string) => (
                        <span key={m} className="bg-gray-800 text-gray-400 text-xs px-1.5 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {exp ? (
                      <span className={`text-sm font-medium ${isExpired ? 'text-red-400' : isSoon ? 'text-amber-400' : 'text-gray-300'}`}>
                        {exp.toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-sm">No expiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <UpdateLicenseForm licenseId={license.id} currentTier={license.tier} currentExpiry={license.hosting_expires_at} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
