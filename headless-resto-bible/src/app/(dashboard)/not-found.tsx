import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center text-4xl mb-8">
        🔍
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-4">
        Page Not <span className="text-brand-blue">Found</span>
      </h1>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
