'use client';

import { useState } from 'react';
import { updateProfile } from '@/actions/staff';
import { useRouter } from 'next/navigation';

export default function ProfileSettings({ user, staff }: { user: any, staff: any }) {
  const [name, setName] = useState(staff?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile(user.id, name);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="md:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/30 space-y-10">
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-blue/20 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input type="email" defaultValue={user.email} disabled className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-bold text-slate-400 cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900">Security & Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-white hover:ring-2 hover:ring-brand-blue/10 transition-all">
            <div>
              <p className="font-black text-slate-900 text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400 mt-1">Highly recommended for platform security.</p>
            </div>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-white hover:ring-2 hover:ring-brand-blue/10 transition-all">
            <div>
              <p className="font-black text-slate-900 text-sm">Change Access Password</p>
              <p className="text-xs text-slate-400 mt-1">Last changed 4 months ago.</p>
            </div>
            <button className="text-[10px] font-black text-brand-blue uppercase tracking-widest px-4 py-2 bg-white rounded-xl shadow-sm hover:text-brand-orange transition-colors">Update</button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-black text-center animate-in fade-in slide-in-from-bottom-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-10 py-4 bg-brand-orange text-white rounded-[24px] text-sm font-black shadow-xl shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
  );
}
