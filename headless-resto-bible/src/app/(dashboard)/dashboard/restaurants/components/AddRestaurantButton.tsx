'use client';

import { useState } from 'react';
import { addRestaurant } from '@/actions/restaurants';

export default function AddRestaurantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addRestaurant(formData);
      setIsOpen(false);
    } catch (error) {
      alert('Failed to add restaurant');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-brand-blue text-brand-orange rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 shadow-xl shadow-brand-blue/20 transition-all"
      >
        Add Restaurant
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Register <span className="text-brand-blue underline decoration-brand-orange/20">New Resto</span></h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Establishment Name</label>
                <input name="name" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="e.g. Blue Lagoon Bistro" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner / Manager</label>
                <input name="owner" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="Full name" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Location</label>
                <input name="location" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="City, Country" />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full py-5 bg-brand-blue text-brand-orange rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Processing Registration...' : 'Authorize Establishment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
