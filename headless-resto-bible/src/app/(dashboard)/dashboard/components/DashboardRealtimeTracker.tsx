'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardRealtimeTracker() {
  const supabase = createClient();
  const router = useRouter();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const channels = [
      supabase
        .channel('public:leads')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
          setToastMessage(`New Lead: ${payload.new.name}`);
          triggerUpdate();
        })
        .subscribe(),
      supabase
        .channel('public:waitlist')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'waitlist' }, (payload) => {
          setToastMessage(`New Waitlist Signup: ${payload.new.email}`);
          triggerUpdate();
        })
        .subscribe(),
      supabase
        .channel('public:reservations')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, (payload) => {
          setToastMessage(`New Reservation: ${payload.new.customer_name}`);
          triggerUpdate();
        })
        .subscribe(),
      supabase
        .channel('public:restaurants')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'restaurants' }, (payload) => {
          setToastMessage(`New Restaurant Request: ${payload.new.name}`);
          triggerUpdate();
        })
        .subscribe(),
    ];

    function triggerUpdate() {
      setLastUpdate(new Date().toLocaleTimeString());
      setShowToast(true);
      router.refresh();
      setTimeout(() => setShowToast(false), 5000);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [supabase, router]);

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-10 duration-500">
          <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-2xl border border-white/10 flex items-center space-x-4 min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center animate-bounce">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Update</p>
              <p className="text-sm font-bold text-white tracking-tight">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm border border-slate-100 px-4 py-2 rounded-full">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Live Sync {lastUpdate && `• Last update: ${lastUpdate}`}
        </span>
      </div>
    </>
  );
}
