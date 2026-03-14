'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase';
import { apiFetch } from '../../lib/api';

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function deriveSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }

    try {
      const org = await apiFetch<any>('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: orgName, slug }),
        accessToken: session.access_token,
      });

      await apiFetch('/locations', {
        method: 'POST',
        body: JSON.stringify({ name: locationName }),
        accessToken: session.access_token,
        orgId: org.id,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Set up your restaurant</h1>
        <p className="text-gray-500 text-sm mb-6">This takes about 2 minutes.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant name</label>
            <input
              required
              value={orgName}
              onChange={(e) => { setOrgName(e.target.value); setSlug(deriveSlug(e.target.value)); }}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Mama's Kitchen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL slug</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className="bg-gray-100 px-3 py-2 text-sm text-gray-500">restaurantos.com/menu/</span>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="mamas-kitchen"
                pattern="[a-z0-9-]+"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First location name</label>
            <input
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Downtown"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Setting up…' : 'Get started'}
          </button>
        </form>
      </div>
    </div>
  );
}
