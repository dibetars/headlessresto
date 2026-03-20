import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Header({ pageTitle = 'Dashboard' }: { pageTitle?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: staff } = await supabase
    .from('staff')
    .select('name, role')
    .eq('id', user?.id)
    .single();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 flex items-center space-x-12">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase whitespace-nowrap">
          {pageTitle}
        </h1>
        
        <div className="flex-1 max-w-xl hidden lg:block">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors">
              🔍
            </span>
            <input 
              type="text" 
              placeholder="Search platform resources..." 
              className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-3 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-blue/10 focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-3 text-slate-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-2xl transition-all">
          <span className="text-xl">🔔</span>
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-orange rounded-full border-2 border-white shadow-sm"></span>
        </button>

        <div className="h-10 w-px bg-slate-100"></div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none tracking-tight">{staff?.name || 'User'}</p>
            <p className="text-[10px] font-black text-brand-blue/60 uppercase tracking-widest mt-1.5">
              {staff?.role?.replace('_', ' ') || 'Guest'}
            </p>
          </div>
          <Link href="/dashboard/profile" className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-brand-orange font-black shadow-xl shadow-brand-blue/20 hover:scale-105 transition-transform">
            {staff?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}
