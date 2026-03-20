'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateReservationStatus, deleteReservation } from '@/actions/reservations';

export default function ReservationList() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const fetchReservations = async () => {
    const { data, error } = await supabase.from('reservations').select('*').order('reservation_date', { ascending: true });
    if (data) setReservations(data);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    setLoading(id);
    try {
      await updateReservationStatus(id, status);
      await fetchReservations();
    } catch (error) {
      console.error('Failed to update reservation:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reservation?')) {
      setLoading(id);
      try {
        await deleteReservation(id);
        await fetchReservations();
      } catch (error) {
        console.error('Failed to delete reservation:', error);
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
            Current <span className="text-brand-orange underline decoration-brand-orange/20">Reservations</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Manage your table bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time updates</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Customer</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Schedule</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Guests</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue font-black italic">
                      {reservation.customer_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{reservation.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Ref: {reservation.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <p className="text-sm font-bold text-slate-700">{new Date(reservation.reservation_date).toLocaleDateString()}</p>
                  <p className="text-[10px] text-brand-orange font-black uppercase tracking-widest">{reservation.reservation_time}</p>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter">
                    {reservation.number_of_guests} Guests
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    {
                      'confirmed': 'bg-emerald-50 text-emerald-600',
                      'pending': 'bg-amber-50 text-amber-600',
                      'cancelled': 'bg-rose-50 text-rose-600',
                    }[reservation.status as string] || 'bg-slate-100 text-slate-600'
                  }`}>
                    {reservation.status}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {reservation.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                        disabled={loading === reservation.id}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-50"
                        title="Confirm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(reservation.id)}
                      disabled={loading === reservation.id}
                      className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No reservations found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
