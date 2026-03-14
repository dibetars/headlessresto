'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { createClient } from '../../../lib/supabase';

export default function SettingsPage() {
  const [location, setLocation] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) return;
    setSession(s);
    const { data: m } = await supabase.from('org_memberships')
      .select('location_id, org_id, organizations(id, name, slug), locations(*)')
      .eq('user_id', s.user.id).eq('is_active', true).limit(1).single();
    if (!m) return;
    setOrg((m as any).organizations);
    setLocation((m as any).locations);
  }

  async function saveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!location) return;
    setSaving(true);
    await supabase.from('locations').update({
      name: location.name, address: location.address, city: location.city,
      state: location.state, zip: location.zip, timezone: location.timezone,
    }).eq('id', location.id);
    setSaving(false);
  }

  async function startStripeOnboarding() {
    if (!session || !location) return;
    const { data: m } = await supabase.from('org_memberships').select('org_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/payments/stripe-connect/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, 'x-organization-id': m!.org_id, 'x-location-id': location.id },
      body: JSON.stringify({ return_url: window.location.href }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  if (!location) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <form onSubmit={saveLocation} className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Name', 'name'], ['Address', 'address'], ['City', 'city'],
            ['State', 'state'], ['ZIP', 'zip'], ['Timezone', 'timezone'],
          ].map(([label, key]) => (
            <div key={key} className={key === 'address' ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input value={location[key] || ''} onChange={(e) => setLocation({ ...location, [key]: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Stripe Connect</h2>
        <p className="text-sm text-gray-500 mb-4">
          Connect your Stripe account to accept payments from the QR menu.
        </p>
        {location.stripe_account_id ? (
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">Connected ✓</span>
            <span className="text-xs text-gray-400">{location.stripe_account_id}</span>
          </div>
        ) : (
          <button onClick={startStripeOnboarding}
            className="flex items-center gap-2 px-4 py-2 bg-[#635BFF] hover:bg-[#5249d8] text-white text-sm font-medium rounded-lg transition">
            <ExternalLink size={14} /> Connect with Stripe
          </button>
        )}
      </div>
    </div>
  );
}
