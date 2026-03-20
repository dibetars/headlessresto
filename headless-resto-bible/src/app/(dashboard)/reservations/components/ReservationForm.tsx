
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { addReservation } from '@/actions/reservations';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center space-x-3 ${
        pending 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : 'bg-brand-blue text-white hover:bg-brand-blue-dark hover:scale-[1.02] active:scale-95 shadow-brand-blue/20'
      }`}
    >
      {pending ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Confirming...</span>
        </span>
      ) : (
        <>
          <span>Confirm Reservation</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </>
      )}
    </button>
  );
}

export default function ReservationForm() {
  const [state, formAction] = useFormState(addReservation, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const email = formData.get('customer_email') as string;
    const phone = formData.get('customer_phone') as string;
    const guests = parseInt(formData.get('number_of_guests') as string);
    const date = formData.get('reservation_date') as string;
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      e.preventDefault();
      return;
    }

    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
      alert('Please enter a valid phone number.');
      e.preventDefault();
      return;
    }

    if (guests < 1) {
      alert('Number of guests must be at least 1.');
      e.preventDefault();
      return;
    }

    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (reservationDate < today) {
      alert('Reservation date cannot be in the past.');
      e.preventDefault();
      return;
    }
  };

  const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all font-medium";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block";

  return (
    <form action={formAction} onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Book a <span className="text-brand-blue">Table</span></h2>
        <p className="text-slate-500 text-sm font-medium">Reserve your spot in seconds. We'll confirm via email.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="customer_name" className={labelClasses}>Full Name</label>
          <input 
            type="text" 
            id="customer_name" 
            name="customer_name" 
            placeholder="John Doe"
            required 
            className={inputClasses} 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="customer_email" className={labelClasses}>Email Address</label>
          <input 
            type="email" 
            id="customer_email" 
            name="customer_email" 
            placeholder="john@example.com"
            required 
            className={inputClasses} 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="customer_phone" className={labelClasses}>Phone Number</label>
          <input 
            type="tel" 
            id="customer_phone" 
            name="customer_phone" 
            placeholder="+1 (555) 000-0000"
            className={inputClasses} 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="number_of_guests" className={labelClasses}>Guests</label>
          <input 
            type="number" 
            id="number_of_guests" 
            name="number_of_guests" 
            min="1" 
            placeholder="2"
            required 
            className={inputClasses} 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="reservation_date" className={labelClasses}>Date</label>
          <input 
            type="date" 
            id="reservation_date" 
            name="reservation_date" 
            required 
            className={inputClasses} 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="reservation_time" className={labelClasses}>Time</label>
          <input 
            type="time" 
            id="reservation_time" 
            name="reservation_time" 
            required 
            className={inputClasses} 
          />
        </div>
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>

      {state?.message && (
        <p className={`text-center text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-500 ${
          state.message.includes('Success') ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
