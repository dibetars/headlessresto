import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileSettings from './components/ProfileSettings';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Account <span className="text-brand-orange underline decoration-brand-orange/20">Profile</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your identity and preferences.</p>
        </div>
        <button className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-sm font-black hover:bg-rose-100 transition-all">
          Deactivate Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Profile Identity */}
        <div className="md:col-span-1 space-y-6">
          <div className="w-full aspect-square bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-[48px] flex items-center justify-center text-white text-7xl font-black shadow-2xl shadow-brand-blue/20">
            {staff?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">{staff?.name || 'Platform Admin'}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{staff?.role?.replace('_', ' ') || 'Super Admin'}</p>
          </div>
          <button className="w-full py-4 bg-brand-blue text-white rounded-[24px] text-sm font-black hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue/10">
            Upload New Photo
          </button>
        </div>

        {/* Profile Settings */}
        <ProfileSettings user={user} staff={staff} />
      </div>
    </div>
  );
}