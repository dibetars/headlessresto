'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center text-4xl mb-8">
        ⚠️
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-4">
        Something went <span className="text-brand-orange">wrong!</span>
      </h1>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        We encountered an unexpected error. Don't worry, our team has been notified.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-8 py-3 border border-slate-200 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
