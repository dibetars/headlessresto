'use client';

import { useState } from 'react';

interface Props {
  licenseId: string;
  currentExpiry: string;
  renewAction: (licenseId: string, newExpiry: string) => Promise<void>;
}

export default function RenewForm({ licenseId, currentExpiry, renewAction }: Props) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function renew(months: number) {
    setSaving(true);
    const base = new Date(currentExpiry) > new Date() ? new Date(currentExpiry) : new Date();
    base.setMonth(base.getMonth() + months);

    await renewAction(licenseId, base.toISOString());

    setSaving(false);
    setDone(true);
  }

  if (done) return <span className="text-xs text-green-400 font-medium">Renewed</span>;

  return (
    <div className="flex gap-1.5">
      {[1, 3, 12].map((months) => (
        <button
          key={months}
          onClick={() => renew(months)}
          disabled={saving}
          className="text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-2.5 py-1 rounded-md transition-colors"
        >
          +{months}mo
        </button>
      ))}
    </div>
  );
}
