'use client';

import { useState } from 'react';

interface Props {
  licenseId: string;
  currentTier: string;
  currentExpiry: string | null;
  updateAction: (licenseId: string, tier: string, expiry: string | null) => Promise<void>;
}

export default function UpdateLicenseForm({ licenseId, currentTier, currentExpiry, updateAction }: Props) {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState(currentTier);
  const [expiry, setExpiry] = useState(currentExpiry ? currentExpiry.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateAction(licenseId, tier, expiry || null);
    setSaving(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
        Edit
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        <option value="starter">Starter</option>
        <option value="professional">Professional</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <input
        type="date"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      <button onClick={save} disabled={saving} className="text-xs text-green-400 hover:text-green-300 font-medium disabled:opacity-50">
        {saving ? '…' : 'Save'}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-400">
        Cancel
      </button>
    </div>
  );
}
